export const NOTIFICATION_SEVERITIES = [
  "info",
  "success",
  "warning",
  "critical",
] as const;
export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number];
export type Notification = {
  id: string;
  userId: string;
  notificationType: string;
  title: string;
  message: string;
  link: string | null;
  severity: NotificationSeverity;
  readAt: string | null;
  dismissedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  expiresAt: string | null;
};
export type NotificationDraft = Pick<
  Notification,
  "message" | "notificationType" | "title" | "userId"
> &
  Partial<Pick<Notification, "expiresAt" | "link" | "metadata" | "severity">>;
