import "server-only";
import { getCurrentUser } from "@/lib/supabase/auth";
import type { NotificationDraft } from "@/types/notification";
import {
  countUnreadNotifications,
  insertNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notificationRepository";
async function userId() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required.");
  return user.id;
}
export async function getUserNotifications(limit = 20, offset = 0) {
  return listNotifications(
    await userId(),
    Math.min(50, Math.max(1, limit)),
    Math.max(0, offset),
  );
}
export async function getUnreadNotificationCount() {
  const user = await getCurrentUser();
  return user ? countUnreadNotifications(user.id) : 0;
}
export async function createNotification(draft: NotificationDraft) {
  return insertNotification(draft);
}
export async function readNotification(id: string) {
  return markNotificationRead(await userId(), id);
}
export async function readAllNotifications() {
  return markAllNotificationsRead(await userId());
}
