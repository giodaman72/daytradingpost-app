import type { Alert } from "@/types/alert";
import type { ChartAnnotation } from "@/types/chart";
export function normalizeOwnedAlertAnnotations(
  alerts: Alert[],
  userId: string,
  instrumentSlug: string,
) {
  return alerts.flatMap((alert): ChartAnnotation[] => {
    const threshold = Number(alert.thresholdValue);
    if (
      alert.userId !== userId ||
      alert.instrumentSlug !== instrumentSlug ||
      alert.thresholdValue === null ||
      !Number.isFinite(threshold)
    )
      return [];
    return [
      {
        id: `alert:${alert.id}`,
        kind: "alert",
        label: `${alert.name} · ${alert.status}`,
        value: threshold,
        timestamp: alert.lastTriggeredAt,
        sourceId: alert.id,
        sourceType: "alert",
        premium: true,
      },
    ];
  });
}
