import type { Alert } from "@/types/alert";
export function isAlertExpired(alert: Alert, now = new Date()) {
  return Boolean(
    alert.expiresAt && Date.parse(alert.expiresAt) <= now.getTime(),
  );
}
export function isAlertCoolingDown(alert: Alert, now = new Date()) {
  return Boolean(
    alert.lastTriggeredAt &&
    Date.parse(alert.lastTriggeredAt) + alert.cooldownMinutes * 60_000 >
      now.getTime(),
  );
}
