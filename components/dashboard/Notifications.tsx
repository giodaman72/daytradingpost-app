import Link from "next/link";
import type { Notification } from "@/types/notification";
import { DashboardPanel } from "./DashboardPanel";
import { localizeHref, type Locale } from "@/lib/i18n/config";
export function Notifications({
  notifications,
  unreadCount,
  locale = "en",
}: {
  notifications: Notification[];
  unreadCount: number;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  return (
    <DashboardPanel
      id="notifications"
      eyebrow={`${unreadCount} ${spanish ? "sin leer" : "unread"}`}
      title={spanish ? "Notificaciones" : "Notifications"}
    >
      {notifications.length ? (
        <ul className="dashboard-notifications">
          {notifications.slice(0, 4).map((item) => (
            <li key={item.id}>
              <span aria-hidden="true">!</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.message}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="dashboard-empty">
          <p>
            {spanish
              ? "Todavía no hay notificaciones para miembros."
              : "No member notifications yet."}
          </p>
        </div>
      )}
      <Link
        href={localizeHref("/alerts/history", locale)}
        className="text-link"
      >
        {spanish ? "Revisar historial de alertas" : "Review alert history"} →
      </Link>
    </DashboardPanel>
  );
}
