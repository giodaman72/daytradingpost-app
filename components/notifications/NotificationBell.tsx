import { Bell } from "lucide-react";
import Link from "next/link";
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications";
import { readAllNotificationsAction } from "@/app/notifications/actions";
import { NotificationBadge } from "./NotificationBadge";
import { NotificationList } from "./NotificationList";
import { localizeHref, type Locale } from "@/lib/i18n/config";
export async function NotificationBell({ locale = "en" }: { locale?: Locale }) {
  const spanish = locale === "es";
  let count = 0;
  let notifications: Awaited<ReturnType<typeof getUserNotifications>> = [];
  try {
    [count, notifications] = await Promise.all([
      getUnreadNotificationCount(),
      getUserNotifications(5),
    ]);
  } catch {
    return null;
  }
  return (
    <details className="notification-menu">
      <summary
        aria-label={
          spanish
            ? `Notificaciones, ${count} sin leer`
            : `Notifications, ${count} unread`
        }
      >
        <Bell size={18} aria-hidden="true" />
        <NotificationBadge count={count} />
      </summary>
      <div className="notification-popover">
        <header>
          <strong>{spanish ? "Notificaciones" : "Notifications"}</strong>
          {count ? (
            <form action={readAllNotificationsAction}>
              <button type="submit">
                {spanish ? "Marcar todas como leídas" : "Mark all read"}
              </button>
            </form>
          ) : null}
        </header>
        <NotificationList notifications={notifications} locale={locale} />
        <Link href={localizeHref("/alerts/history", locale)}>
          {spanish ? "Ver historial de alertas" : "View alert history"}
        </Link>
      </div>
    </details>
  );
}
