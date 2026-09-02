import Link from "next/link";
import type { Notification } from "@/types/notification";
import { readNotificationAction } from "@/app/notifications/actions";
import { localizeHref, type Locale } from "@/lib/i18n/config";
export function NotificationItem({
  notification,
  locale = "en",
}: {
  notification: Notification;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  return (
    <li className={`notification-item severity-${notification.severity}`}>
      <div>
        <strong>{notification.title}</strong>
        <p>{notification.message}</p>
        <time dateTime={notification.createdAt}>
          {new Date(notification.createdAt).toLocaleDateString(
            spanish ? "es-ES" : "en-US",
          )}
        </time>
      </div>
      {notification.link ? (
        <Link href={localizeHref(notification.link, locale)}>
          {spanish ? "Revisar" : "Review"}
        </Link>
      ) : null}
      {!notification.readAt ? (
        <form action={readNotificationAction}>
          <input type="hidden" name="id" value={notification.id} />
          <input
            type="hidden"
            name="notificationType"
            value={notification.notificationType}
          />
          <button type="submit">
            {spanish ? "Marcar como leída" : "Mark read"}
          </button>
        </form>
      ) : (
        <span>{spanish ? "Leída" : "Read"}</span>
      )}
    </li>
  );
}
