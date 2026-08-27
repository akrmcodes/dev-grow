import { streamText } from "ai";
import { getErrorStatus, shouldTryNextModel } from "@/lib/api-errors";
import {
  getPreferredModels,
  markModelRateLimited,
} from "@/lib/model-router";

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

export async function streamTextWithModelFallback(
  buildParams: (modelId: string) => StreamTextParams,
): Promise<StreamTextResultType> {
  let lastError: unknown;

  for (const modelId of getPreferredModels()) {
    const result = streamText({
      ...buildParams(modelId),
      maxRetries: 0,
    });

    try {
      await probeStreamResult(result);
      return result;
    } catch (error) {
      lastError = error;
      console.error(error);

      if (shouldTryNextModel(error)) {
        if (getErrorStatus(error) === 429) {
          markModelRateLimited(modelId);
        }
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error("All models unavailable");
}
