import { describe, expect, it } from "vitest";
import { hasActiveMembership } from "./membershipStatus";

const activeProfile = {
  current_period_end: "2999-01-01T00:00:00.000Z",
  membership_status: "active" as const,
  payment_verified_at: "2026-07-14T12:00:00.000Z",
};

describe("hasActiveMembership", () => {
  it("accepts a verified active membership with time remaining", () => {
    expect(hasActiveMembership(activeProfile)).toBe(true);
  });

  it("rejects an unverified membership", () => {
    expect(
      hasActiveMembership({ ...activeProfile, payment_verified_at: null }),
    ).toBe(false);
  });

  it("rejects an expired membership", () => {
    expect(
      hasActiveMembership({
        ...activeProfile,
        current_period_end: "2000-01-01T00:00:00.000Z",
      }),
    ).toBe(false);
  });
});
