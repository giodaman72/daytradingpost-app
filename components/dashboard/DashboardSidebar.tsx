import Link from "next/link";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  CircleUserRound,
  Crown,
  LayoutDashboard,
  ListPlus,
  Radio,
} from "lucide-react";
import { DASHBOARD_NAVIGATION } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";

const dashboardIcons = {
  "academy-progress": BookOpen,
  "economic-calendar": CalendarDays,
  "latest-analysis": LayoutDashboard,
  "market-outlook": ChartNoAxesCombined,
  membership: Crown,
  notifications: Bell,
  watchlist: ListPlus,
  webinar: Radio,
} as const;

export function DashboardSidebar() {
  return (
    <aside className="dashboard-sidebar" aria-label="Trader dashboard navigation">
      <div className="dashboard-sidebar-heading">
        <span className="dashboard-sidebar-mark" aria-hidden="true">DTP</span>
        <div><strong>Trader Dashboard</strong><span>Daily command center</span></div>
      </div>

      <nav aria-label="Dashboard sections">
        {DASHBOARD_NAVIGATION.map(({ href, id, label }) => {
          const Icon = dashboardIcons[id];
          return (
            <Link href={href} key={href}>
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <Link href={ROUTES.account} className="dashboard-sidebar-account">
        <CircleUserRound size={18} aria-hidden="true" />
        Account settings
      </Link>
    </aside>
  );
}
