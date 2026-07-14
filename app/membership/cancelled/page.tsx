import type { Metadata } from "next";
import { MembershipStatusPage } from "@/components/membership/MembershipStatusPage";

export const metadata: Metadata = { title: "Membership checkout cancelled", robots: { index: false } };

export default function MembershipCancelledPage() {
  return (
    <MembershipStatusPage
      kicker="Checkout cancelled"
      title="No membership change was made."
      description="You can return to the premium plans whenever you are ready. Premium access is never granted for an incomplete payment."
      tone="cancelled"
    />
  );
}
