import Link from "next/link";
import { Check, Crown } from "lucide-react";
import type { BillingProfile } from "@/lib/membership/types";
import { DashboardPanel } from "./DashboardPanel";

function formatLabel(value: string | null | undefined) {
  return (value || "free").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function MembershipCard({
  hasPremiumAccess,
  profile,
}: {
  hasPremiumAccess: boolean;
  profile: BillingProfile | null;
}) {
  const storedStatus = profile?.membership_status || "free";
  const accessStatus =
    storedStatus === "active" && !hasPremiumAccess ? "expired" : storedStatus;
  const membershipTitle = hasPremiumAccess
    ? "Premium member"
    : accessStatus === "pending"
      ? "Verification pending"
      : accessStatus === "expired"
        ? "Premium access expired"
        : "Free membership";

  return (
    <DashboardPanel id="membership" eyebrow="Account access" title="Membership Card">
      <div className={`dashboard-membership-card ${hasPremiumAccess ? "active" : "free"}`}>
        <div className="dashboard-membership-topline">
          <span><Crown size={22} aria-hidden="true" /></span>
          <div><strong>{membershipTitle}</strong><p>{formatLabel(profile?.membership_plan)} plan</p></div>
          <b>{formatLabel(accessStatus)}</b>
        </div>
        <ul>
          <li><Check size={15} aria-hidden="true" />Personal trader dashboard</li>
          <li><Check size={15} aria-hidden="true" />Published market analysis</li>
          <li><Check size={15} aria-hidden="true" />{hasPremiumAccess ? "Full premium briefings" : "Premium article previews"}</li>
        </ul>
        <Link href={hasPremiumAccess ? "/account/billing" : "/premium"} className="button button-full">
          {hasPremiumAccess ? "Manage membership" : "Explore Premium"}
        </Link>
      </div>
    </DashboardPanel>
  );
}
