import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { BillingProfile } from "./types";

export function hasActiveMembership(
  profile: Pick<
    BillingProfile,
    "current_period_end" | "membership_status" | "payment_verified_at"
  > | null,
) {
  if (
    profile?.membership_status !== "active" ||
    !profile.payment_verified_at
  ) {
    return false;
  }

  if (!profile.current_period_end) return true;

  const periodEnd = Date.parse(profile.current_period_end);
  return Number.isFinite(periodEnd) && periodEnd > Date.now();
}

export const getMembershipAccess = cache(async () => {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return { user: null, profile: null, hasPremiumAccess: false };
  }

  const { data } = await supabase
    .from("profiles")
    .select(
      "email,full_name,membership_plan,membership_status,payment_customer_id,payment_provider,payment_reference,payment_subscription_id,current_period_end,payment_verified_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  const profile = (data as BillingProfile | null) ?? null;
  const hasPremiumAccess = hasActiveMembership(profile);

  return { user, profile, hasPremiumAccess };
});
