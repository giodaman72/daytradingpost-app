import Link from "next/link";
import {
  Bell,
  BookOpen,
  Award,
  CalendarDays,
  ChartNoAxesCombined,
  CircleUserRound,
  Crown,
  LayoutDashboard,
  ListPlus,
  Route,
  Sparkles,
  Radio,
  ShieldAlert,
} from "lucide-react";
import { DASHBOARD_NAVIGATION } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { localizeHref, type Locale } from "@/lib/i18n/config";

const spanishLabels: Record<string, string> = {
  "Advanced chart": "Gráfico avanzado",
  "Market outlook": "Perspectiva de mercados",
  "Latest analysis": "Análisis recientes",
  "Economic calendar": "Calendario económico",
  Webinars: "Webinars",
  Watchlist: "Lista de seguimiento",
  "Smart alerts": "Alertas inteligentes",
  Academy: "Academia",
  "Learning paths": "Rutas de aprendizaje",
  "Recommended learning": "Aprendizaje recomendado",
  Certificates: "Certificados",
  Membership: "Membresía",
  Notifications: "Notificaciones",
};

const dashboardIcons = {
  "advanced-chart": ChartNoAxesCombined,
  "academy-progress": BookOpen,
  certificates: Award,
  "economic-calendar": CalendarDays,
  "latest-analysis": LayoutDashboard,
  "learning-paths": Route,
  "market-outlook": ChartNoAxesCombined,
  membership: Crown,
  notifications: Bell,
  recommendations: Sparkles,
  "smart-alerts": ShieldAlert,
  watchlist: ListPlus,
  webinar: Radio,
} as const;

export function DashboardSidebar({ locale = "en" }: { locale?: Locale }) {
  const spanish = locale === "es";
  return (
    <aside
      className="dashboard-sidebar"
      aria-label={
        spanish
          ? "Navegación del panel de trading"
          : "Trader dashboard navigation"
      }
    >
      <div className="dashboard-sidebar-heading">
        <span className="dashboard-sidebar-mark" aria-hidden="true">
          DTP
        </span>
        <div>
          <strong>{spanish ? "Panel de trading" : "Trader Dashboard"}</strong>
          <span>
            {spanish ? "Centro de control diario" : "Daily command center"}
          </span>
        </div>
      </div>

      <nav aria-label={spanish ? "Secciones del panel" : "Dashboard sections"}>
        {DASHBOARD_NAVIGATION.map(({ href, id, label }) => {
          const Icon = dashboardIcons[id];
          return (
            <Link href={localizeHref(href, locale)} key={href}>
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>{spanish ? (spanishLabels[label] ?? label) : label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href={localizeHref(ROUTES.account, locale)}
        className="dashboard-sidebar-account"
      >
        <CircleUserRound size={18} aria-hidden="true" />
        {spanish ? "Configuración de la cuenta" : "Account settings"}
      </Link>
    </aside>
  );
}
