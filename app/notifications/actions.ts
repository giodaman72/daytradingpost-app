"use server";
import { revalidatePath } from "next/cache";
import { readAllNotifications, readNotification } from "@/lib/notifications";
export async function readNotificationAction(formData: FormData) {
  await readNotification(String(formData.get("id")));
  revalidatePath("/", "layout");
}
export async function readAllNotificationsAction() {
  await readAllNotifications();
  revalidatePath("/", "layout");
}
