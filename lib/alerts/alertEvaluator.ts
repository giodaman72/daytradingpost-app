import { createHash } from "node:crypto";
import type {
  Alert,
  AlertEvaluationInput,
  AlertEvaluationResult,
} from "@/types/alert";
import { isAlertCoolingDown, isAlertExpired } from "./alertCooldown";

function scaled(value: string) {
  const negative = value.startsWith("-");
  const [whole, fraction = ""] = value.replace("-", "").split(".");
  return {
    value: BigInt(`${negative ? "-" : ""}${whole}${fraction.padEnd(10, "0")}`),
    scale: 10,
  };
}
export function compareDecimals(
  left: string,
  operator: Alert["conditionOperator"],
  right: string,
) {
  const a = scaled(left).value;
  const b = scaled(right).value;
  if (operator === "gt") return a > b;
  if (operator === "gte") return a >= b;
  if (operator === "lt") return a < b;
  if (operator === "lte") return a <= b;
  return false;
}
export function evaluateAlert(
  alert: Alert,
  input: AlertEvaluationInput,
  now = new Date(),
): AlertEvaluationResult {
  const base = {
    alertId: alert.id,
    sourceTimestamp: input.sourceTimestamp,
    deduplicationKey: null,
    triggerValue: input.value ?? null,
  };
  if (alert.status !== "active")
    return { ...base, triggered: false, reason: "Alert is not active." };
  if (isAlertExpired(alert, now))
    return { ...base, triggered: false, reason: "Alert has expired." };
  if (isAlertCoolingDown(alert, now))
    return { ...base, triggered: false, reason: "Alert cooldown is active." };
  if (input.simulated)
    return {
      ...base,
      triggered: false,
      reason: "Simulated data cannot trigger alerts.",
    };
  if (input.stale)
    return { ...base, triggered: false, reason: "Source data is too stale." };
  let triggered = false;
  if (
    ["gt", "gte", "lt", "lte"].includes(alert.conditionOperator) &&
    input.value &&
    alert.thresholdValue
  )
    triggered = compareDecimals(
      input.value,
      alert.conditionOperator,
      alert.thresholdValue,
    );
  else if (alert.conditionOperator === "changed")
    triggered = Boolean(
      input.value && input.previousValue && input.value !== input.previousValue,
    );
  else if (alert.conditionOperator === "published")
    triggered = input.eventStatus === "published";
  else if (alert.conditionOperator === "released")
    triggered =
      input.eventStatus === "released" || input.eventStatus === "revised";
  else if (
    alert.conditionOperator === "scheduled_within" &&
    input.scheduledTime &&
    alert.thresholdValue
  ) {
    const remaining = Date.parse(input.scheduledTime) - now.getTime();
    triggered =
      remaining >= 0 && remaining <= Number(alert.thresholdValue) * 60_000;
  }
  const sourceIdentity = alert.alertType.startsWith("economic_event_")
    ? input.sourceId
    : `${input.sourceId}:${input.sourceTimestamp}`;
  const key = triggered
    ? createHash("sha256")
        .update(
          `${alert.id}:${sourceIdentity}:${alert.comparisonReference ?? ""}`,
        )
        .digest("hex")
    : null;
  return {
    ...base,
    triggered,
    deduplicationKey: key,
    reason: triggered
      ? "Alert condition matched verified source data."
      : "Alert condition did not match.",
  };
}
