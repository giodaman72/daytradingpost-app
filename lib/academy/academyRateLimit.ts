import "server-only";

import { enforceMutationRateLimit } from "@/lib/mutationRateLimit";
import { AcademyError } from "./academyErrors";

export function enforceAcademyRateLimit(
  userId: string,
  namespace: string,
  maximum: number,
  windowMs = 60_000,
) {
  try {
    enforceMutationRateLimit(userId, `academy:${namespace}`, maximum, windowMs);
  } catch {
    throw new AcademyError(
      "ACADEMY_RATE_LIMITED",
      "Too many Academy changes. Please wait and try again.",
      { retryAfter: Math.ceil(windowMs / 1_000) },
    );
  }
}
