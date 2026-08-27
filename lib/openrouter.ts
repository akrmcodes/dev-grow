import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openRouterFetch } from "@/lib/openrouter-fetch";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error(
    "OPENROUTER_API_KEY is not set. Add it to .env.local at the project root.",
  );
}

export const PRIMARY_MODEL =
  process.env.PRIMARY_MODEL ?? "google/gemma-4-31b-it:free";
/** Reliable instruct model when the primary is rate-limited. */
export const FALLBACK_MODEL =
  process.env.FALLBACK_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free";
/** Last-resort smart router — may pick niche models; kept after explicit fallbacks. */
export const ROUTER_MODEL =
  process.env.ROUTER_MODEL ?? "openrouter/free";

export const openrouter = createOpenRouter({
  apiKey,
  fetch: openRouterFetch,
});
