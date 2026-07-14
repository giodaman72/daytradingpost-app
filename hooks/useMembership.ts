"use client";

import { hasActiveMembership } from "@/lib/payments/membershipStatus";
import { useAuth } from "./useAuth";

export function useMembership() {
  const { profile } = useAuth();

  return {
    hasPremiumAccess: hasActiveMembership(profile),
    plan: profile?.membership_plan ?? "free",
    status: profile?.membership_status ?? "free",
  };
}
