import { Bell } from "lucide-react";
import Link from "next/link";
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications";
import { readAllNotificationsAction } from "@/app/notifications/actions";
import { NotificationBadge } from "./NotificationBadge";
import { NotificationList } from "./NotificationList";
export async function NotificationBell() {
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
      <summary aria-label={`Notifications, ${count} unread`}>
        <Bell size={18} aria-hidden="true" />
        <NotificationBadge count={count} />
      </summary>
      <div className="notification-popover">
        <header>
          <strong>Notifications</strong>
          {count ? (
            <form action={readAllNotificationsAction}>
              <button type="submit">Mark all read</button>
            </form>
          ) : null}
        </header>
        <NotificationList notifications={notifications} />
        <Link href="/alerts/history">View alert history</Link>
      </div>
    </details>
  );
}
