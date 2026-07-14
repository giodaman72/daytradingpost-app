import type { Metadata } from "next";
import { MembershipStatusPage } from "@/components/membership/MembershipStatusPage";
import { getMembershipAccess } from "@/lib/payments";

export const metadata: Metadata = {
  title: "Membership checkout complete",
  robots: { index: false },
};

export default async function MembershipSuccessPage() {
  const access = await getMembershipAccess();
  const active = access.hasPremiumAccess;

  return (
    <MembershipStatusPage
      kicker={active ? "Membership active" : "Payment received"}
      title={
        active
          ? "Welcome to DayTradingPost Premium."
          : "Your payment is being confirmed."
      }
      description={
        active
          ? "Your verified membership is active and premium analysis is now available."
          : "Revolut returned you to DayTradingPost. Access remains pending until the signed payment update is processed."
      }
      reference={access.profile?.payment_reference}
      tone={active ? "success" : "pending"}
    />
  );
}
