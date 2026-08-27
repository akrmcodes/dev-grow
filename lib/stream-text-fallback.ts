import { streamText } from "ai";
import { getErrorStatus, shouldTryNextModel } from "@/lib/api-errors";
import { getPreferredModels, markModelFailed } from "@/lib/model-router";
import { getNativeModelFallbacks } from "@/lib/openrouter";

type StreamTextParams = Parameters<typeof streamText>[0];
type StreamTextResultType = ReturnType<typeof streamText>;

/**
 * Consumes a tee'd branch until the model proves it is responding or fails.
 * `streamText` tees its base stream, so `toUIMessageStream()` still receives
 * the full output on a separate branch.
 */
async function probeStreamResult(result: StreamTextResultType): Promise<void> {
  for await (const part of result.fullStream) {
    if (part.type === "error") {
      throw part.error;
    }

    if (
      part.type === "text-delta" ||
      part.type === "reasoning-delta" ||
      part.type === "finish"
    ) {
      return;
    }
  }
}

function createExhaustedError(
  lastError: unknown,
  lastStatus?: number,
): Error {
  const error = new Error("All models unavailable");
  if (lastStatus != null) {
    (error as Error & { status: number }).status = lastStatus;
  }
  if (lastError) {
    error.cause = lastError;
  }
  return error;
}

export async function streamTextWithModelFallback(
  buildParams: (
    modelId: string,
    nativeFallbacks: string[],
  ) => StreamTextParams,
): Promise<StreamTextResultType> {
  const models = getPreferredModels();
  let lastError: unknown;
  let lastStatus: number | undefined;

  for (const modelId of models) {
    const nativeFallbacks = getNativeModelFallbacks(modelId, models);
    const result = streamText({
      ...buildParams(modelId, nativeFallbacks),
      maxRetries: 0,
    });

    try {
      await probeStreamResult(result);
      return result;
    } catch (error) {
      lastError = error;
      const status = getErrorStatus(error);
      if (status != null) {
        lastStatus = status;
      }
      console.error(error);

      if (shouldTryNextModel(error)) {
        markModelFailed(modelId, status);
        continue;
      }

      throw error;
    }
  }

  throw createExhaustedError(lastError, lastStatus);
}
