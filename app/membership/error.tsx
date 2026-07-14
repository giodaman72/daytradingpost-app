"use client";

import { MembershipErrorState } from "@/components/membership/MembershipErrorState";

export default function MembershipError({ reset }: { reset: () => void }) {
  return <MembershipErrorState reset={reset} />;
}
