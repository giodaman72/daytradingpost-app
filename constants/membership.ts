import type { MembershipPlan, MembershipStatus } from "@/types/membership";

export const MEMBERSHIP_PLANS = {
  annual: {
    amount: 249.99,
    currency: "EUR",
    label: "Annual membership",
    name: "One annual membership",
    priceLabel: "€249.99 EUR per year",
    priceLabelEs: "249,99 € al año",
  },
  monthly: {
    amount: 49.99,
    currency: "EUR",
    label: "Monthly membership",
    name: "Flexible monthly access",
    priceLabel: "€49.99 EUR per month",
    priceLabelEs: "49,99 € al mes",
  },
} as const satisfies Record<
  MembershipPlan,
  {
    amount: number;
    currency: "EUR";
    label: string;
    name: string;
    priceLabel: string;
    priceLabelEs: string;
  }
>;

/** Percent saved by paying yearly instead of 12 monthly payments, rounded down. */
export function annualSavingsPercent() {
  const yearOfMonthly = MEMBERSHIP_PLANS.monthly.amount * 12;
  return Math.floor((1 - MEMBERSHIP_PLANS.annual.amount / yearOfMonthly) * 100);
}

/** What the annual plan works out to per month, rounded to cents. */
export function annualMonthlyEquivalent() {
  return Math.round((MEMBERSHIP_PLANS.annual.amount / 12) * 100) / 100;
}

export const PREMIUM_BENEFITS = [
  "Full premium market analysis",
  "Detailed scenarios and technical levels",
  "Member-only risk and planning notes",
  "Server-protected premium access",
] as const;

export const MEMBERSHIP_STATUS_LABELS = {
  active: "Active",
  cancelled: "Cancelled",
  failed: "Failed",
  free: "Free",
  past_due: "Past Due",
  pending: "Pending",
  trialing: "Trialing",
} as const satisfies Record<MembershipStatus, string>;
