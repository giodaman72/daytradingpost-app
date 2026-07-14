import type { MembershipPlan, MembershipStatus } from "@/types/membership";

export const MEMBERSHIP_PLANS = {
  annual: {
    label: "Annual membership",
    name: "One annual membership",
  },
  monthly: {
    label: "Monthly membership",
    name: "Flexible monthly access",
  },
} as const satisfies Record<MembershipPlan, { label: string; name: string }>;

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
