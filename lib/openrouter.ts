import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error(
    "OPENROUTER_API_KEY is not set. Add it to .env.local at the project root.",
  );
}

export const PRIMARY_MODEL = "google/gemma-4-31b-it:free";
export const FALLBACK_MODEL = "openai/gpt-oss-20b:free";

export const openrouter = createOpenRouter({ apiKey });
