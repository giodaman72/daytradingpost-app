import type { Notification } from "@/types/notification";
import { NotificationEmptyState } from "./NotificationEmptyState";
import { NotificationItem } from "./NotificationItem";
export function NotificationList({
  notifications,
}: {
  notifications: Notification[];
}) {
  return notifications.length ? (
    <ul className="notification-list">
      {notifications.map((item) => (
        <NotificationItem notification={item} key={item.id} />
      ))}
    </ul>
  ) : (
    <NotificationEmptyState />
  );
}
