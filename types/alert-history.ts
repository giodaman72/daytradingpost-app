import type { AlertChannel } from "./alert";
export type AlertHistoryEvent = {
  id: string;
  alertId: string;
  userId: string;
  instrumentSlug: string | null;
  eventType: string;
  triggerValue: string | null;
  thresholdValue: string | null;
  sourceTimestamp: string;
  notificationStatus:
    "pending" | "delivered" | "partial" | "failed" | "skipped";
  notificationChannels: AlertChannel[];
  metadata: Record<string, unknown>;
  triggeredAt: string;
  acknowledgedAt: string | null;
  createdAt: string;
};
