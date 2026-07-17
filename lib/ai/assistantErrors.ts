export type AssistantErrorCode =
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "INVALID_REQUEST"
  | "LIMIT_REACHED"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "NOT_FOUND"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_TIMEOUT"
  | "PROVIDER_ERROR"
  | "NO_CONTEXT"
  | "INTERNAL_ERROR";

export class AssistantError extends Error {
  constructor(
    public readonly code: AssistantErrorCode,
    message: string,
    public readonly status: number,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "AssistantError";
  }
}

export function normalizeAssistantError(error: unknown) {
  if (error instanceof AssistantError) return error;
  return new AssistantError(
    "INTERNAL_ERROR",
    "The assistant could not complete this request. Please try again.",
    500,
  );
}
