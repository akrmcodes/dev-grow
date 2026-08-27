import { generateObject } from "ai";
import { getErrorStatus, shouldTryNextModel } from "@/lib/api-errors";
import { getPreferredModels, markModelFailed } from "@/lib/model-router";
import { getNativeModelFallbacks, openrouter } from "@/lib/openrouter";
import { SCORECARD_PROMPT } from "@/lib/prompts";
import { ScorecardSchema, type ScorecardResult } from "@/lib/schemas";

// Next.js requires a route-segment literal — keep in sync with MAX_DURATION in lib/constants.ts
export const maxDuration = 30;

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

async function generateScorecard(code: string): Promise<ScorecardResult> {
  const prompt = `${SCORECARD_PROMPT}\n\n\`\`\`\n${code}\n\`\`\``;
  const models = getPreferredModels();
  let lastError: unknown;
  let lastStatus: number | undefined;

  for (const model of models) {
    const nativeFallbacks = getNativeModelFallbacks(model, models);

    try {
      const result = await generateObject({
        model: openrouter.chat(model, {
          plugins: [{ id: "response-healing" }],
          ...(nativeFallbacks.length > 0 ? { models: nativeFallbacks } : {}),
        }),
        schema: ScorecardSchema,
        prompt,
        maxRetries: 0,
      });

      return result.object;
    } catch (error) {
      lastError = error;
      const status = getErrorStatus(error);
      if (status != null) {
        lastStatus = status;
      }
      console.error(error);

      if (shouldTryNextModel(error)) {
        markModelFailed(model, status);
        continue;
      }

      throw error;
    }
  }

  throw createExhaustedError(lastError, lastStatus);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { code } = body as { code?: unknown };

  if (typeof code !== "string" || code.trim().length === 0) {
    return Response.json({ error: "No code provided." }, { status: 400 });
  }

  try {
    const scorecard = await generateScorecard(code);
    return Response.json(scorecard, { status: 200 });
  } catch (error) {
    console.error(error);
    const status = getErrorStatus(error);

    if (status === 429) {
      return Response.json({ error: "RATE_LIMIT" }, { status: 429 });
    }

    return Response.json({ error: "SCORE_UNAVAILABLE" }, { status: 500 });
  }
}
