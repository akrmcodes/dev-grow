/** Ordered free instruct/coding models — explicit slugs only (no openrouter/free). */
function parseModelChain(): string[] {
  if (process.env.FREE_MODEL_CHAIN) {
    return process.env.FREE_MODEL_CHAIN.split(",")
      .map((slug) => slug.trim())
      .filter(Boolean);
  }

  return [
    process.env.PRIMARY_MODEL ?? "google/gemma-4-31b-it:free",
    process.env.FALLBACK_MODEL ?? "google/gemma-4-26b-a4b-it:free",
    process.env.CODING_FALLBACK_MODEL ?? "cohere/north-mini-code:free",
    process.env.LAST_RESORT_MODEL ?? "nvidia/nemotron-3-super-120b-a12b:free",
  ];
}

export const FREE_MODEL_CHAIN: readonly string[] = parseModelChain();

export const PRIMARY_MODEL = FREE_MODEL_CHAIN[0] ?? "google/gemma-4-31b-it:free";

export function getNativeModelFallbacks(
  model: string,
  chain: readonly string[] = FREE_MODEL_CHAIN,
): string[] {
  const index = chain.indexOf(model);
  if (index < 0) return [];
  return chain.slice(index + 1);
}
