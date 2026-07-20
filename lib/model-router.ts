import { FALLBACK_MODEL, PRIMARY_MODEL } from "@/lib/openrouter";

const RATE_LIMIT_TTL_MS = 5 * 60 * 1000;

let primaryRateLimitedUntil = 0;

/**
 * Returns models in preferred order. When the primary was recently rate-limited,
 * the fallback is tried first so both chat and score routes share the same state.
 */
export function getPreferredModels(): [string, string] {
  if (Date.now() < primaryRateLimitedUntil) {
    return [FALLBACK_MODEL, PRIMARY_MODEL];
  }

  return [PRIMARY_MODEL, FALLBACK_MODEL];
}

export function markModelRateLimited(model: string): void {
  if (model === PRIMARY_MODEL) {
    primaryRateLimitedUntil = Date.now() + RATE_LIMIT_TTL_MS;
  }
}
