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

const dashboardLinks = [
  { href: "#market-outlook", label: "Market outlook", icon: ChartNoAxesCombined },
  { href: "#latest-analysis", label: "Latest analysis", icon: LayoutDashboard },
  { href: "#economic-calendar", label: "Economic calendar", icon: CalendarDays },
  { href: "#webinar", label: "Webinars", icon: Radio },
  { href: "#watchlist", label: "Watchlist", icon: ListPlus },
  { href: "#academy-progress", label: "Academy", icon: BookOpen },
  { href: "#membership", label: "Membership", icon: Crown },
  { href: "#notifications", label: "Notifications", icon: Bell },
] as const;

export function DashboardSidebar() {
  return (
    <aside className="dashboard-sidebar" aria-label="Trader dashboard navigation">
      <div className="dashboard-sidebar-heading">
        <span className="dashboard-sidebar-mark" aria-hidden="true">DTP</span>
        <div><strong>Trader Dashboard</strong><span>Daily command center</span></div>
      </div>

      <nav aria-label="Dashboard sections">
        {dashboardLinks.map(({ href, icon: Icon, label }) => (
          <Link href={href} key={href}>
            <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <Link href="/account" className="dashboard-sidebar-account">
        <CircleUserRound size={18} aria-hidden="true" />
        Account settings
      </Link>
    </aside>
  );
}
