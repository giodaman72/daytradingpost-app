import Link from "next/link";
import type { Notification } from "@/types/notification";
import { DashboardPanel } from "./DashboardPanel";
export function Notifications({
  notifications,
  unreadCount,
}: {
  notifications: Notification[];
  unreadCount: number;
}) {
  return (
    <DashboardPanel
      id="notifications"
      eyebrow={`${unreadCount} unread`}
      title="Notifications"
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
          <p>No member notifications yet.</p>
        </div>
      )}
      <Link href="/alerts/history" className="text-link">
        Review alert history →
      </Link>
    </DashboardPanel>
  );
}
