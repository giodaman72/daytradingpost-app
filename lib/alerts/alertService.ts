import "server-only";
import { getSmartFeatureLimits } from "@/constants/smart-alerts";
import { getMembershipAccess } from "@/lib/membership/access";
import { enforceMutationRateLimit } from "@/lib/mutationRateLimit";
import {
  acknowledgeHistory,
  findAlert,
  insertAlert,
  listAlerts,
  listHistory,
  patchAlert,
  removeAlert,
} from "./alertRepository";
import { validateAlertInput } from "./alertValidation";

async function context() {
  const access = await getMembershipAccess();
  if (!access.user) throw new Error("Authentication required.");
  return {
    userId: access.user.id,
    premium: access.hasPremiumAccess,
    limits: getSmartFeatureLimits(access.hasPremiumAccess),
  };
}
export async function getUserAlerts(limit = 50, offset = 0) {
  const { userId } = await context();
  return listAlerts(
    userId,
    Math.min(50, Math.max(1, limit)),
    Math.max(0, offset),
  );
}
export async function getAlertById(id: string) {
  const { userId } = await context();
  return findAlert(userId, id);
}
export async function createAlert(raw: Record<string, unknown>) {
  const { userId, premium, limits } = await context();
  enforceMutationRateLimit(userId, "alerts");
  const active = (await listAlerts(userId, 100)).filter(
    (item) => item.status === "active",
  );
  if (active.length >= limits.activeAlerts)
    throw new Error("Your membership active-alert limit has been reached.");
  const parsed = validateAlertInput(raw, { premium });
  if (!parsed.valid || !parsed.value)
    throw new Error(Object.values(parsed.errors)[0] ?? "Invalid alert.");
  return insertAlert(userId, parsed.value);
}
export async function updateAlert(id: string, raw: Record<string, unknown>) {
  const { userId, premium } = await context();
  enforceMutationRateLimit(userId, "alerts");
  const current = await findAlert(userId, id);
  if (!current) throw new Error("Alert not found.");
  const parsed = validateAlertInput({ ...current, ...raw }, { premium });
  if (!parsed.valid || !parsed.value)
    throw new Error(Object.values(parsed.errors)[0] ?? "Invalid alert.");
  const value = parsed.value;
  return patchAlert(userId, id, {
    watchlist_id: value.watchlistId,
    instrument_slug: value.instrumentSlug,
    alert_type: value.alertType,
    name: value.name,
    condition_operator: value.conditionOperator,
    threshold_value: value.thresholdValue,
    comparison_reference: value.comparisonReference,
    economic_event_id: value.economicEventId,
    market_intelligence_field: value.marketIntelligenceField,
    channels: value.channels,
    cooldown_minutes: value.cooldownMinutes,
    expires_at: value.expiresAt,
  });
}
export async function pauseAlert(id: string) {
  const { userId } = await context();
  enforceMutationRateLimit(userId, "alerts");
  return patchAlert(userId, id, { status: "paused" });
}
export async function resumeAlert(id: string) {
  const { userId, limits } = await context();
  enforceMutationRateLimit(userId, "alerts");
  const active = (await listAlerts(userId, 100)).filter(
    (item) => item.status === "active",
  );
  if (active.length >= limits.activeAlerts)
    throw new Error("Your membership active-alert limit has been reached.");
  return patchAlert(userId, id, { status: "active" });
}
export async function deleteAlert(id: string) {
  const { userId } = await context();
  enforceMutationRateLimit(userId, "alerts");
  return removeAlert(userId, id);
}
export async function getAlertHistory(limit = 50, offset = 0) {
  const { userId } = await context();
  return listHistory(
    userId,
    Math.min(50, Math.max(1, limit)),
    Math.max(0, offset),
  );
}
export async function acknowledgeAlertEvent(id: string) {
  const { userId } = await context();
  enforceMutationRateLimit(userId, "alerts");
  return acknowledgeHistory(userId, id);
}
