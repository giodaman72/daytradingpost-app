import type { Metadata } from "next";
import { MembershipStatusPage } from "@/components/membership/MembershipStatusPage";
import { getMembershipAccess } from "@/lib/payments";

export const metadata: Metadata = {
  title: "Membership pending",
  robots: { index: false },
};

export default async function MembershipPendingPage() {
  const access = await getMembershipAccess();
  return (
    <MembershipStatusPage
      kicker="Verification pending"
      title="We are verifying your Revolut payment."
      description="Keep the reference below. Payment-link purchases require administrator verification and never unlock premium content automatically."
      reference={access.profile?.payment_reference}
    />
  );
}
