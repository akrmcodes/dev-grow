import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openRouterFetch } from "@/lib/openrouter-fetch";
import {
  FREE_MODEL_CHAIN,
  PRIMARY_MODEL,
  getNativeModelFallbacks,
} from "@/lib/openrouter-models";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error(
    "OPENROUTER_API_KEY is not set. Add it to .env.local at the project root.",
  );
}

export { FREE_MODEL_CHAIN, PRIMARY_MODEL, getNativeModelFallbacks };

export const openrouter = createOpenRouter({
  apiKey,
  fetch: openRouterFetch,
});
