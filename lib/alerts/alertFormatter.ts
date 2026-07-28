import type { Alert, AlertEvaluationResult } from "@/types/alert";
export function formatAlertCondition(alert: Alert) {
  const threshold = alert.thresholdValue ? ` ${alert.thresholdValue}` : "";
  return `${alert.conditionOperator.replaceAll("_", " ")}${threshold}`;
}
export function formatAlertNotification(
  alert: Alert,
  result: AlertEvaluationResult,
  delayed = false,
) {
  return {
    notificationType: "alert_triggered",
    title: alert.name,
    message: `${alert.instrumentSlug ?? "Tracked event"} matched ${formatAlertCondition(alert)} at ${result.triggerValue ?? "the configured event"}.${delayed ? " Source data is delayed." : ""}`,
    link: `/alerts/${alert.id}`,
    severity: "warning" as const,
  };
}
