import Link from "next/link";
import type { Alert } from "@/types/alert";
import { DashboardPanel } from "./DashboardPanel";
import { AlertStatusBadge } from "@/components/alerts/AlertStatusBadge";
import { localizeHref, type Locale } from "@/lib/i18n/config";
export function SmartAlerts({
  alerts,
  locale = "en",
}: {
  alerts: Alert[];
  locale?: Locale;
}) {
  const spanish = locale === "es";
  const active = alerts.filter((item) => item.status === "active");
  const recent = alerts.filter((item) => item.lastTriggeredAt).slice(0, 3);
  return (
    <DashboardPanel
      id="smart-alerts"
      eyebrow={`${active.length} ${spanish ? "activas" : "active"}`}
      title={spanish ? "Alertas inteligentes" : "Smart alerts"}
      action={
        <Link href={localizeHref("/alerts/new", locale)}>
          {spanish ? "Creación rápida" : "Quick create"}
        </Link>
      }
    >
      <div className="dashboard-alert-summary">
        <strong>{active.length}</strong>
        <span>
          {spanish
            ? "condiciones evaluadas en el servidor"
            : "conditions evaluated server-side"}
        </span>
      </div>
      {recent.length ? (
        <ul>
          {recent.map((alert) => (
            <li key={alert.id}>
              <AlertStatusBadge status={alert.status} />
              <Link href={localizeHref(`/alerts/${alert.id}`, locale)}>
                {alert.name}
              </Link>
              <time dateTime={alert.lastTriggeredAt!}>
                {new Date(alert.lastTriggeredAt!).toLocaleDateString(
                  spanish ? "es-ES" : "en-US",
                )}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          {spanish
            ? "No hay alertas activadas recientemente."
            : "No recently triggered alerts."}
        </p>
      )}
      <Link className="text-link" href={localizeHref("/alerts", locale)}>
        {spanish ? "Gestionar alertas" : "Manage alerts"} →
      </Link>
    </DashboardPanel>
  );
}
