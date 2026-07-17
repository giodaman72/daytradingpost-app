import "server-only";
import { insertNotification } from "../notificationRepository";
import type { NotificationDraft } from "@/types/notification";
export const dashboardNotificationChannel = {
  id: "dashboard",
  async deliver(draft: NotificationDraft) {
    await insertNotification(draft);
    return { delivered: true, status: "delivered" as const };
  },
};
