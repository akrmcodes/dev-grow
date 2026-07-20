import { generateObject, NoObjectGeneratedError } from "ai";
import { getErrorStatus } from "@/lib/api-errors";
import {
  getPreferredModels,
  markModelRateLimited,
} from "@/lib/model-router";
import { openrouter } from "@/lib/openrouter";
import { SCORECARD_PROMPT } from "@/lib/prompts";
import { ScorecardSchema, type ScorecardResult } from "@/lib/schemas";

// Next.js requires a route-segment literal — keep in sync with MAX_DURATION in lib/constants.ts
export const maxDuration = 30;

async function generateScorecard(code: string): Promise<ScorecardResult> {
  const prompt = `${SCORECARD_PROMPT}\n\n\`\`\`\n${code}\n\`\`\``;

  for (const model of getPreferredModels()) {
    try {
      const result = await generateObject({
        model: openrouter.chat(model, {
          plugins: [{ id: "response-healing" }],
        }),
        schema: ScorecardSchema,
        prompt,
        maxRetries: 0,
      });

      return result.object;
    } catch (error) {
      console.error(error);
      if (getErrorStatus(error) === 429) {
        markModelRateLimited(model);
        continue;
      }
      if (NoObjectGeneratedError.isInstance(error)) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("All models unavailable");
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
    // Three-layer reliability strategy:
    // (1) generateObject() + Zod schema enforcement
    // (2) OpenRouter Response Healing plugin
    // (3) Application-level fallback JSON for the Scorecard UI
    const status = getErrorStatus(error);

    if (status === 429) {
      return Response.json({ error: "RATE_LIMIT" }, { status: 429 });
    }

    return Response.json({ error: "SCORE_UNAVAILABLE" }, { status: 500 });
  }
}
