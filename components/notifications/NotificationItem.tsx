import Link from "next/link";
import type { Notification } from "@/types/notification";
import { readNotificationAction } from "@/app/notifications/actions";
export function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  return (
    <li className={`notification-item severity-${notification.severity}`}>
      <div>
        <strong>{notification.title}</strong>
        <p>{notification.message}</p>
        <time dateTime={notification.createdAt}>
          {new Date(notification.createdAt).toLocaleDateString("en-US")}
        </time>
      </div>
      {notification.link ? <Link href={notification.link}>Review</Link> : null}
      {!notification.readAt ? (
        <form action={readNotificationAction}>
          <input type="hidden" name="id" value={notification.id} />
          <button type="submit">Mark read</button>
        </form>
      ) : (
        <span>Read</span>
      )}
    </li>
  );
}
