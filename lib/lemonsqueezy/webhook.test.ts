import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  mapLemonSqueezySubscription,
  verifyLemonSqueezySignature,
} from "./webhook";

const secret = "whsec_test_secret";
const body = JSON.stringify({ meta: { event_name: "subscription_created" } });
const sign = (raw: string, key = secret) =>
  createHmac("sha256", key).update(raw).digest("hex");

describe("verifyLemonSqueezySignature", () => {
  it("accepts the HMAC-SHA256 hex digest of the raw body", () => {
    expect(
      verifyLemonSqueezySignature({
        rawBody: body,
        secret,
        signature: sign(body),
      }),
    ).toBe(true);
  });

  it("rejects a missing, malformed, wrong-key or tampered signature", () => {
    expect(
      verifyLemonSqueezySignature({ rawBody: body, secret, signature: null }),
    ).toBe(false);
    expect(
      verifyLemonSqueezySignature({ rawBody: body, secret, signature: "abc" }),
    ).toBe(false);
    expect(
      verifyLemonSqueezySignature({
        rawBody: body,
        secret,
        signature: sign(body, "other"),
      }),
    ).toBe(false);
    expect(
      verifyLemonSqueezySignature({
        rawBody: body + " ",
        secret,
        signature: sign(body),
      }),
    ).toBe(false);
  });
});

describe("mapLemonSqueezySubscription", () => {
  const renews = "2026-11-20T00:00:00.000Z";
  const ends = "2026-11-05T00:00:00.000Z";

  it("grants access while active or on trial, until the renewal date", () => {
    for (const status of ["active", "on_trial"]) {
      expect(
        mapLemonSqueezySubscription({ status, renews_at: renews }),
      ).toEqual({
        membershipStatus: "active",
        requestStatus: "verified",
        currentPeriodEnd: renews,
      });
    }
  });

  it("keeps access after cancelling until the paid period ends", () => {
    expect(
      mapLemonSqueezySubscription({
        status: "cancelled",
        renews_at: renews,
        ends_at: ends,
      }),
    ).toEqual({
      membershipStatus: "active",
      requestStatus: "verified",
      currentPeriodEnd: ends,
    });
  });

  it("removes access for failed payments, pauses and expiry", () => {
    for (const status of ["past_due", "unpaid", "paused"]) {
      expect(mapLemonSqueezySubscription({ status }).membershipStatus).toBe(
        "past_due",
      );
    }
    expect(
      mapLemonSqueezySubscription({ status: "expired", ends_at: ends }),
    ).toMatchObject({
      membershipStatus: "cancelled",
      requestStatus: "cancelled",
    });
  });

  it("treats an unknown status as pending", () => {
    expect(mapLemonSqueezySubscription({ status: "mystery" })).toMatchObject({
      membershipStatus: "pending",
    });
  });
});
