import "server-only";

import type { MembershipPlan, PaymentProviderMode } from "@/types/membership";

export const REVOLUT_API_VERSION = "2026-04-20";

export function getPaymentProviderMode(): PaymentProviderMode {
  const mode = process.env.PAYMENT_PROVIDER_MODE?.trim();

  if (mode === "revolut_api" || mode === "revolut_payment_links") {
    return mode;
  }

  return "revolut_payment_links";
}

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
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
