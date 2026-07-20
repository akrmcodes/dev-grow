import { APICallError, RetryError } from "ai";

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
