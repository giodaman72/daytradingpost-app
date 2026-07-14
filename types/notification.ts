export type NotificationChannel = "email" | "in_app";
export type NotificationSeverity = "info" | "success" | "warning" | "critical";

export type Notification = {
  channel: NotificationChannel;
  createdAt: string;
  id: string;
  message: string;
  readAt: string | null;
  severity: NotificationSeverity;
  title: string;
  userId: string;
};
