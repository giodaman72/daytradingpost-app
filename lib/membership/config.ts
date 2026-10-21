import "server-only";

import type { MembershipPlan, PaymentProviderMode } from "@/types/membership";

export const REVOLUT_API_VERSION = "2026-04-20";

export function getPaymentProviderMode(): PaymentProviderMode {
  const mode = process.env.PAYMENT_PROVIDER_MODE?.trim();

  if (
    mode === "lemonsqueezy" ||
    mode === "revolut_api" ||
    mode === "revolut_payment_links"
  ) {
    return mode;
  }

  return "revolut_payment_links";
}

export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function getPaymentLink(plan: MembershipPlan) {
  const value =
    plan === "monthly"
      ? process.env.NEXT_PUBLIC_REVOLUT_MONTHLY_PAYMENT_LINK
      : process.env.NEXT_PUBLIC_REVOLUT_ANNUAL_PAYMENT_LINK;

  return value?.trim() || null;
}

export function getPlanVariationId(plan: MembershipPlan) {
  const value =
    plan === "monthly"
      ? process.env.REVOLUT_MONTHLY_PLAN_ID
      : process.env.REVOLUT_ANNUAL_PLAN_ID;

  return value?.trim() || null;
}

export function getRevolutApiConfig() {
  const secret = process.env.REVOLUT_API_SECRET?.trim();
  const baseUrl = process.env.REVOLUT_API_BASE_URL?.trim();

  if (!secret || !baseUrl) {
    throw new Error("Revolut Merchant API is not configured.");
  }

  return { secret, baseUrl: baseUrl.replace(/\/$/, "") };
}

/** Lemon Squeezy store and plan variants. The API key never leaves the server. */
export function getLemonSqueezyConfig() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY?.trim();
  const storeId = process.env.LEMONSQUEEZY_STORE_ID?.trim();

  if (!apiKey || !storeId) {
    throw new Error("Lemon Squeezy is not configured.");
  }

  return {
    apiKey,
    storeId,
    testMode: process.env.LEMONSQUEEZY_TEST_MODE?.trim() === "true",
  };
}

export function getLemonSqueezyVariantId(plan: MembershipPlan) {
  const value =
    plan === "monthly"
      ? process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID
      : process.env.LEMONSQUEEZY_ANNUAL_VARIANT_ID;

  return value?.trim() || null;
}

/** Plan for a Lemon Squeezy variant id, or null when it matches neither. */
export function getPlanForLemonSqueezyVariant(
  variantId: string | number | null | undefined,
): MembershipPlan | null {
  if (variantId === null || variantId === undefined) return null;
  const id = String(variantId);
  if (id === getLemonSqueezyVariantId("monthly")) return "monthly";
  if (id === getLemonSqueezyVariantId("annual")) return "annual";
  return null;
}
