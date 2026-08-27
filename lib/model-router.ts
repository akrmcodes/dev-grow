import { FREE_MODEL_CHAIN } from "@/lib/openrouter-models";

const RATE_LIMIT_TTL_MS = 5 * 60 * 1000;
const UNAVAILABLE_TTL_MS = 24 * 60 * 60 * 1000;

type FailureReason = "429" | "404";

const failedModels = new Map<string, { until: number; reason: FailureReason }>();

function uniqueModels(models: readonly string[]): string[] {
  return [...new Set(models)];
}

function isModelAvailable(model: string, now = Date.now()): boolean {
  const failure = failedModels.get(model);
  return !failure || failure.until <= now;
}

/**
 * Returns models in preferred order, skipping recently rate-limited or retired slugs.
 * When the primary was recently 429'd, fallbacks are tried first.
 */
export function getPreferredModels(): string[] {
  const now = Date.now();
  const available = FREE_MODEL_CHAIN.filter((model) => isModelAvailable(model, now));

  const chain = available.length > 0 ? available : [...FREE_MODEL_CHAIN];
  const primaryFailure = failedModels.get(FREE_MODEL_CHAIN[0] ?? "");

  if (
    primaryFailure &&
    primaryFailure.until > now &&
    primaryFailure.reason === "429"
  ) {
    const primary = FREE_MODEL_CHAIN[0];
    if (primary) {
      return uniqueModels([
        ...chain.filter((model) => model !== primary),
        primary,
      ]);
    }
  }

  return uniqueModels(chain);
}

export function markModelFailed(model: string, status?: number): void {
  if (status === 429) {
    failedModels.set(model, {
      until: Date.now() + RATE_LIMIT_TTL_MS,
      reason: "429",
    });
    return;
  }

  if (status === 404) {
    failedModels.set(model, {
      until: Date.now() + UNAVAILABLE_TTL_MS,
      reason: "404",
    });
  }
}

/** @deprecated Use markModelFailed */
export function markModelRateLimited(model: string): void {
  markModelFailed(model, 429);
}
