import Link from "next/link";
import { BellRing, CircleCheck, Newspaper } from "lucide-react";
import { formatDisplayLabel } from "@/lib/utils";
import { DashboardPanel } from "./DashboardPanel";

export function Notifications({ articleCount, membershipStatus }: { articleCount: number; membershipStatus: string }) {
  const items = [
    {
      icon: Newspaper,
      title: articleCount ? `${articleCount} recent briefings available` : "Analysis notifications ready",
      detail: articleCount ? "Your Sanity research feed is up to date." : "New briefings will be highlighted after publication.",
    },
    {
      icon: CircleCheck,
      title: "Secure account session",
      detail: `Membership status: ${formatDisplayLabel(membershipStatus)}.`,
    },
    {
      icon: BellRing,
      title: "Notification center initialized",
      detail: "Email and in-app alert preferences will be configurable in a future release.",
    },
  ];

  return (
    <DashboardPanel id="notifications" eyebrow="Member updates" title="Notifications">
      <ul className="dashboard-notifications">
        {items.map(({ detail, icon: Icon, title }) => (
          <li key={title}>
            <span><Icon size={17} aria-hidden="true" /></span>
            <div><strong>{title}</strong><p>{detail}</p></div>
          </li>
        ))}
      </ul>
      <Link href="/account" className="text-link">Manage account →</Link>
    </DashboardPanel>
  );
}
