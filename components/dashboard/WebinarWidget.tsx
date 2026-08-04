import Link from "next/link";
import { Video } from "lucide-react";
import { DashboardPanel } from "./DashboardPanel";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export function WebinarWidget({ locale = "en" }: { locale?: Locale }) {
  const spanish = locale === "es";
  return (
    <DashboardPanel
      id="webinar"
      eyebrow={spanish ? "Formación en directo" : "Live education"}
      title={spanish ? "Webinars" : "Webinar Widget"}
    >
      <div className="dashboard-webinar-card">
        <span className="dashboard-webinar-icon">
          <Video size={23} aria-hidden="true" />
        </span>
        <div>
          <span>{spanish ? "Próxima sesión" : "Next session"}</span>
          <h3>
            {spanish
              ? "Sala semanal de planificación de mercados"
              : "Weekly Market Planning Room"}
          </h3>
          <p>
            {spanish
              ? "El calendario de webinars se está preparando. Las nuevas sesiones aparecerán aquí cuando se programen."
              : "The webinar calendar is being prepared. New sessions will appear here when scheduled."}
          </p>
        </div>
        <Link
          href={localizeHref("/webinars", locale)}
          className="button button-secondary"
        >
          {spanish ? "Ver webinars" : "View webinars"}
        </Link>
      </div>
    </DashboardPanel>
  );
}
