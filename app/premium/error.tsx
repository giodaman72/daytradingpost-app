"use client";

import { MembershipErrorState } from "@/components/membership/MembershipErrorState";

export default function PremiumError({ reset }: { reset: () => void }) {
  return <MembershipErrorState reset={reset} />;
}
