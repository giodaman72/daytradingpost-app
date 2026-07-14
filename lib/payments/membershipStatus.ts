import type { BillingProfile } from "@/types/profile";

export function hasActiveMembership(
  profile: Pick<
    BillingProfile,
    "current_period_end" | "membership_status" | "payment_verified_at"
  > | null,
) {
  if (profile?.membership_status !== "active" || !profile.payment_verified_at) {
    return false;
  }

  if (!profile.current_period_end) return true;

  const periodEnd = Date.parse(profile.current_period_end);
  return Number.isFinite(periodEnd) && periodEnd > Date.now();
}
