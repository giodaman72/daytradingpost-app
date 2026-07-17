import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Notification, NotificationDraft } from "@/types/notification";
const map = (row: Record<string, unknown>): Notification => ({
  id: String(row.id),
  userId: String(row.user_id),
  notificationType: String(row.notification_type),
  title: String(row.title),
  message: String(row.message),
  link: row.link as string | null,
  severity: row.severity as Notification["severity"],
  readAt: row.read_at as string | null,
  dismissedAt: row.dismissed_at as string | null,
  metadata: (row.metadata as Record<string, unknown>) ?? {},
  createdAt: String(row.created_at),
  expiresAt: row.expires_at as string | null,
});
export async function listNotifications(
  userId: string,
  limit = 20,
  offset = 0,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .is("dismissed_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error("Notifications are unavailable.");
  return (data ?? []).map(map);
}
export async function countUnreadNotifications(userId: string) {
  const { count, error } = await getSupabaseAdmin()
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null)
    .is("dismissed_at", null);
  if (error) return 0;
  return count ?? 0;
}
export async function insertNotification(draft: NotificationDraft) {
  const { data, error } = await getSupabaseAdmin()
    .from("notifications")
    .insert({
      user_id: draft.userId,
      notification_type: draft.notificationType,
      title: draft.title,
      message: draft.message,
      link: draft.link ?? null,
      severity: draft.severity ?? "info",
      metadata: draft.metadata ?? {},
      expires_at: draft.expiresAt ?? null,
    })
    .select()
    .single();
  if (error) throw new Error("Could not create notification.");
  return map(data);
}
export async function markNotificationRead(userId: string, id: string) {
  const { error } = await getSupabaseAdmin()
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Could not update notification.");
}
export async function markAllNotificationsRead(userId: string) {
  const { error } = await getSupabaseAdmin()
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
  if (error) throw new Error("Could not update notifications.");
}
