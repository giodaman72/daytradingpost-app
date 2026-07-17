export function NotificationBadge({ count }: { count: number }) {
  return count ? (
    <span
      className="notification-badge"
      aria-label={`${count} unread notification${count === 1 ? "" : "s"}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  ) : null;
}
