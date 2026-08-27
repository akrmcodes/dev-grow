import { APICallError, NoObjectGeneratedError, RetryError } from "ai";

export function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }

  if (APICallError.isInstance(error) && error.statusCode != null) {
    return error.statusCode;
  }

  if (RetryError.isInstance(error)) {
    return getErrorStatus(error.lastError);
  }

  if ("cause" in error) {
    return getErrorStatus(error.cause);
  }

  return undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return "";
}

/** True when OpenRouter reports the model slug is gone or no longer on the free tier. */
export function isModelUnavailableError(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status === 404) return true;

  return /unavailable for free|no endpoints found/i.test(getErrorMessage(error));
}

/** Transient network failures — try the next model before giving up. */
export function isTransientNetworkError(error: unknown): boolean {
  if (APICallError.isInstance(error) && error.isRetryable && error.statusCode == null) {
    return true;
  }

  const message = getErrorMessage(error);
  if (
    /connect timeout|cannot connect to api|econnreset|etimedout|enotfound|fetch failed|socket hang up/i.test(
      message,
    )
  ) {
    return true;
  }

  if (error && typeof error === "object" && "cause" in error) {
    return isTransientNetworkError(error.cause);
  }

  return false;
}

/** Retry with the next model in the chain (rate limit, retired slug, or transient failure). */
export function shouldTryNextModel(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status === 429) return true;
  if (status != null && status >= 500) return true;
  if (NoObjectGeneratedError.isInstance(error)) return true;
  return isModelUnavailableError(error) || isTransientNetworkError(error);
}
