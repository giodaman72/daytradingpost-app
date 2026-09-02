import type { Notification } from "@/types/notification";
import { NotificationEmptyState } from "./NotificationEmptyState";
import { NotificationItem } from "./NotificationItem";
import type { Locale } from "@/lib/i18n/config";
export function NotificationList({
  notifications,
  locale = "en",
}: {
  notifications: Notification[];
  locale?: Locale;
}) {
  return notifications.length ? (
    <ul className="notification-list">
      {notifications.map((item) => (
        <NotificationItem notification={item} locale={locale} key={item.id} />
      ))}
    </ul>
  ) : (
    <NotificationEmptyState locale={locale} />
  );
}
