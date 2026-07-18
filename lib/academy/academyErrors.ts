export const ACADEMY_ERROR_CODES = [
  "ACADEMY_UNAUTHENTICATED",
  "ACADEMY_FORBIDDEN",
  "ACADEMY_COURSE_NOT_FOUND",
  "ACADEMY_LESSON_NOT_FOUND",
  "ACADEMY_NOT_ENROLLED",
  "ACADEMY_ALREADY_ENROLLED",
  "ACADEMY_PREMIUM_REQUIRED",
  "ACADEMY_PREREQUISITE_NOT_MET",
  "ACADEMY_LESSON_LOCKED",
  "ACADEMY_ASSESSMENT_NOT_AVAILABLE",
  "ACADEMY_ATTEMPT_LIMIT_REACHED",
  "ACADEMY_ATTEMPT_EXPIRED",
  "ACADEMY_ATTEMPT_ALREADY_SUBMITTED",
  "ACADEMY_INVALID_RESPONSE",
  "ACADEMY_COMPLETION_REQUIREMENTS_NOT_MET",
  "ACADEMY_CERTIFICATE_NOT_ELIGIBLE",
  "ACADEMY_CERTIFICATE_REVOKED",
  "ACADEMY_RATE_LIMITED",
  "ACADEMY_VALIDATION_FAILED",
  "ACADEMY_PROVIDER_UNAVAILABLE",
] as const;

export type AcademyErrorCode = (typeof ACADEMY_ERROR_CODES)[number];

const statusByCode: Record<AcademyErrorCode, number> = {
  ACADEMY_UNAUTHENTICATED: 401,
  ACADEMY_FORBIDDEN: 403,
  ACADEMY_COURSE_NOT_FOUND: 404,
  ACADEMY_LESSON_NOT_FOUND: 404,
  ACADEMY_NOT_ENROLLED: 403,
  ACADEMY_ALREADY_ENROLLED: 409,
  ACADEMY_PREMIUM_REQUIRED: 403,
  ACADEMY_PREREQUISITE_NOT_MET: 409,
  ACADEMY_LESSON_LOCKED: 423,
  ACADEMY_ASSESSMENT_NOT_AVAILABLE: 409,
  ACADEMY_ATTEMPT_LIMIT_REACHED: 429,
  ACADEMY_ATTEMPT_EXPIRED: 409,
  ACADEMY_ATTEMPT_ALREADY_SUBMITTED: 409,
  ACADEMY_INVALID_RESPONSE: 400,
  ACADEMY_COMPLETION_REQUIREMENTS_NOT_MET: 409,
  ACADEMY_CERTIFICATE_NOT_ELIGIBLE: 409,
  ACADEMY_CERTIFICATE_REVOKED: 410,
  ACADEMY_RATE_LIMITED: 429,
  ACADEMY_VALIDATION_FAILED: 400,
  ACADEMY_PROVIDER_UNAVAILABLE: 503,
};

export class AcademyError extends Error {
  readonly code: AcademyErrorCode;
  readonly context: Record<string, string | number | boolean | null>;
  readonly status: number;

  constructor(
    code: AcademyErrorCode,
    message: string,
    context: Record<string, string | number | boolean | null> = {},
  ) {
    super(message);
    this.name = "AcademyError";
    this.code = code;
    this.context = context;
    this.status = statusByCode[code];
  }
}

export function normalizeAcademyError(error: unknown) {
  if (error instanceof AcademyError) return error;
  console.error(
    JSON.stringify({
      domain: "academy",
      error: error instanceof Error ? error.message : "unknown",
    }),
  );
  return new AcademyError(
    "ACADEMY_PROVIDER_UNAVAILABLE",
    "The Academy service is temporarily unavailable. Please try again.",
  );
}
