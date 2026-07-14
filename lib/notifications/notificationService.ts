import type {
  Notification,
  NotificationChannel,
  NotificationSeverity,
} from "@/types/notification";

type NotificationDraft = {
  channel?: NotificationChannel;
  id: string;
  message: string;
  severity?: NotificationSeverity;
  title: string;
  userId: string;
};

export function createNotification(draft: NotificationDraft): Notification {
  return {
    channel: draft.channel ?? "in_app",
    createdAt: new Date().toISOString(),
    id: draft.id,
    message: draft.message,
    readAt: null,
    severity: draft.severity ?? "info",
    title: draft.title,
    userId: draft.userId,
  };
}
