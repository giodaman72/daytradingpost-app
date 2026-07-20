"use server";
import { revalidatePath } from "next/cache";
import { readAllNotifications, readNotification } from "@/lib/notifications";
import { recordAcademyEvent } from "@/lib/academy/academyEventService";
export async function readNotificationAction(formData: FormData) {
  const id = String(formData.get("id"));
  await readNotification(id);
  if (String(formData.get("notificationType")).startsWith("academy_"))
    await recordAcademyEvent({
      idempotencyKey: `academy-notification-opened:${id}`,
      name: "academy_notification_opened",
    }).catch(() => undefined);
  revalidatePath("/", "layout");
}
export async function readAllNotificationsAction() {
  await readAllNotifications();
  revalidatePath("/", "layout");
}
