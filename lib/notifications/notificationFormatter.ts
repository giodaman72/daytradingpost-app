export function safeNotificationLink(value: string | null | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : null;
}
export function escapeEmailText(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
}
export function calculateUnreadCount(
  items: Array<{ readAt: string | null; dismissedAt: string | null }>,
) {
  return items.filter((item) => !item.readAt && !item.dismissedAt).length;
}
