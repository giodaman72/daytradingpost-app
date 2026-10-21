import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  MembershipRequestStatus,
  MembershipStatus,
} from "@/types/membership";

/** Lemon Squeezy signs the raw body with HMAC-SHA256 (hex) in `X-Signature`. */
export function verifyLemonSqueezySignature(input: {
  rawBody: string;
  signature: string | null;
  secret: string;
}) {
  if (!input.signature || !/^[a-f0-9]{64}$/i.test(input.signature.trim())) {
    return false;
  }
  const expected = Buffer.from(
    createHmac("sha256", input.secret).update(input.rawBody).digest("hex"),
    "hex",
  );
  const received = Buffer.from(input.signature.trim(), "hex");
  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

/** Webhook events that change a subscription's state. */
export const LEMONSQUEEZY_SUBSCRIPTION_EVENTS = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
]);

/**
 * Maps a Lemon Squeezy subscription to DayTradingPost membership fields.
 * A cancelled subscription keeps access until `ends_at`, so it stays
 * "active" with that end date; access stops once it has expired.
 */
export function mapLemonSqueezySubscription(attributes: {
  status: string;
  renews_at?: string | null;
  ends_at?: string | null;
}): {
  membershipStatus: MembershipStatus;
  requestStatus: MembershipRequestStatus;
  currentPeriodEnd: string | null;
} {
  switch (attributes.status) {
    case "active":
    case "on_trial":
      return {
        membershipStatus: "active",
        requestStatus: "verified",
        currentPeriodEnd: attributes.renews_at ?? null,
      };
    case "cancelled":
      return {
        membershipStatus: "active",
        requestStatus: "verified",
        currentPeriodEnd: attributes.ends_at ?? null,
      };
    case "past_due":
    case "unpaid":
    case "paused":
      return {
        membershipStatus: "past_due",
        requestStatus: "failed",
        currentPeriodEnd: null,
      };
    case "expired":
      return {
        membershipStatus: "cancelled",
        requestStatus: "cancelled",
        currentPeriodEnd: attributes.ends_at ?? null,
      };
    default:
      return {
        membershipStatus: "pending",
        requestStatus: "pending",
        currentPeriodEnd: null,
      };
  }
}
