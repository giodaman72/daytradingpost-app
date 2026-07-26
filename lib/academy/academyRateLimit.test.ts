import { describe, expect, it } from "vitest";
import { AcademyError } from "./academyErrors";
import { enforceAcademyRateLimit } from "./academyRateLimit";

describe("Academy rate limiting", () => {
  it("allows the configured burst and returns a typed retryable error", () => {
    enforceAcademyRateLimit("rate-limit-test-user", "test", 1, 12_000);

    expect(() =>
      enforceAcademyRateLimit("rate-limit-test-user", "test", 1, 12_000),
    ).toThrowError(
      expect.objectContaining<Partial<AcademyError>>({
        code: "ACADEMY_RATE_LIMITED",
        context: { retryAfter: 12 },
        status: 429,
      }),
    );
  });

  it("isolates mutation namespaces", () => {
    expect(() =>
      enforceAcademyRateLimit("rate-limit-test-user", "other-test", 1),
    ).not.toThrow();
  });
});
