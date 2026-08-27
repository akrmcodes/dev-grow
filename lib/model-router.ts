import {
  FALLBACK_MODEL,
  PRIMARY_MODEL,
  ROUTER_MODEL,
} from "@/lib/openrouter";

const RATE_LIMIT_TTL_MS = 5 * 60 * 1000;

const MODEL_CHAIN = [PRIMARY_MODEL, FALLBACK_MODEL, ROUTER_MODEL] as const;

let primaryRateLimitedUntil = 0;

function uniqueModels(models: readonly string[]): string[] {
  return [...new Set(models)];
}

/**
 * Returns models in preferred order. When the primary was recently rate-limited,
 * explicit fallbacks are tried first so both chat and score routes share state.
 */
export function getPreferredModels(): string[] {
  if (Date.now() < primaryRateLimitedUntil) {
    return uniqueModels([FALLBACK_MODEL, ROUTER_MODEL, PRIMARY_MODEL]);
  }

  return uniqueModels(MODEL_CHAIN);
}

export function markModelRateLimited(model: string): void {
  if (model === PRIMARY_MODEL) {
    primaryRateLimitedUntil = Date.now() + RATE_LIMIT_TTL_MS;
  }
}
