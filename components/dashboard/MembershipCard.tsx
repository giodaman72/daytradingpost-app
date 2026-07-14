import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { formatDisplayLabel } from "@/lib/utils";
import type { BillingProfile } from "@/types/profile";
import { DashboardPanel } from "./DashboardPanel";

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
          <div><strong>{membershipTitle}</strong><p>{formatDisplayLabel(profile?.membership_plan, "Free")} plan</p></div>
          <b>{formatDisplayLabel(accessStatus, "Free")}</b>
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
