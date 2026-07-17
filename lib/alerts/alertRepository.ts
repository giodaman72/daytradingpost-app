import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Alert, CreateAlertInput } from "@/types/alert";
import type { AlertHistoryEvent } from "@/types/alert-history";
const mapAlert = (r: Record<string, unknown>): Alert => ({
  id: String(r.id),
  userId: String(r.user_id),
  watchlistId: r.watchlist_id as string | null,
  instrumentSlug: r.instrument_slug as string | null,
  alertType: r.alert_type as Alert["alertType"],
  name: String(r.name),
  conditionOperator: r.condition_operator as Alert["conditionOperator"],
  thresholdValue: r.threshold_value === null ? null : String(r.threshold_value),
  comparisonReference: r.comparison_reference as string | null,
  economicEventId: r.economic_event_id as string | null,
  marketIntelligenceField: r.market_intelligence_field as string | null,
  channels: r.channels as Alert["channels"],
  status: r.status as Alert["status"],
  cooldownMinutes: Number(r.cooldown_minutes),
  lastEvaluatedAt: r.last_evaluated_at as string | null,
  lastTriggeredAt: r.last_triggered_at as string | null,
  expiresAt: r.expires_at as string | null,
  createdAt: String(r.created_at),
  updatedAt: String(r.updated_at),
});
const mapHistory = (r: Record<string, unknown>): AlertHistoryEvent => ({
  id: String(r.id),
  alertId: String(r.alert_id),
  userId: String(r.user_id),
  instrumentSlug: r.instrument_slug as string | null,
  eventType: String(r.event_type),
  triggerValue: r.trigger_value === null ? null : String(r.trigger_value),
  thresholdValue: r.threshold_value === null ? null : String(r.threshold_value),
  sourceTimestamp: String(r.source_timestamp),
  notificationStatus:
    r.notification_status as AlertHistoryEvent["notificationStatus"],
  notificationChannels:
    r.notification_channels as AlertHistoryEvent["notificationChannels"],
  metadata: (r.metadata as Record<string, unknown>) ?? {},
  triggeredAt: String(r.triggered_at),
  acknowledgedAt: r.acknowledged_at as string | null,
  createdAt: String(r.created_at),
});
export async function listAlerts(userId: string, limit = 50, offset = 0) {
  const { data, error } = await getSupabaseAdmin()
    .from("alerts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error("Alerts are unavailable.");
  return (data ?? []).map(mapAlert);
}
export async function findAlert(userId: string, id: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("alerts")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Alert is unavailable.");
  return data ? mapAlert(data) : null;
}
export async function insertAlert(userId: string, input: CreateAlertInput) {
  const { data, error } = await getSupabaseAdmin()
    .from("alerts")
    .insert({
      user_id: userId,
      watchlist_id: input.watchlistId,
      instrument_slug: input.instrumentSlug,
      alert_type: input.alertType,
      name: input.name,
      condition_operator: input.conditionOperator,
      threshold_value: input.thresholdValue,
      comparison_reference: input.comparisonReference,
      economic_event_id: input.economicEventId,
      market_intelligence_field: input.marketIntelligenceField,
      channels: input.channels,
      cooldown_minutes: input.cooldownMinutes,
      expires_at: input.expiresAt,
    })
    .select()
    .single();
  if (error)
    throw new Error(
      error.code === "23505"
        ? "An equivalent event reminder already exists."
        : "Could not create alert.",
    );
  return mapAlert(data);
}
export async function patchAlert(
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("alerts")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();
  if (error || !data) throw new Error("Alert not found.");
  return mapAlert(data);
}
export async function removeAlert(userId: string, id: string) {
  const { error } = await getSupabaseAdmin()
    .from("alerts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Could not delete alert.");
}
export async function listHistory(userId: string, limit = 50, offset = 0) {
  const { data, error } = await getSupabaseAdmin()
    .from("alert_history")
    .select("*")
    .eq("user_id", userId)
    .order("triggered_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error("Alert history is unavailable.");
  return (data ?? []).map(mapHistory);
}
export async function insertHistory(
  alert: Alert,
  result: {
    deduplicationKey: string;
    sourceTimestamp: string;
    triggerValue: string | null;
  },
  metadata: Record<string, unknown>,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("alert_history")
    .insert({
      alert_id: alert.id,
      user_id: alert.userId,
      instrument_slug: alert.instrumentSlug,
      event_type: alert.alertType,
      trigger_value: result.triggerValue,
      threshold_value: alert.thresholdValue,
      source_timestamp: result.sourceTimestamp,
      notification_channels: alert.channels,
      deduplication_key: result.deduplicationKey,
      metadata,
    })
    .select()
    .single();
  if (error?.code === "23505") return null;
  if (error) throw new Error("Could not record alert event.");
  return mapHistory(data);
}
export async function listActiveAlerts(limit: number) {
  const { data, error } = await getSupabaseAdmin()
    .from("alerts")
    .select("*")
    .eq("status", "active")
    .order("last_evaluated_at", { ascending: true, nullsFirst: true })
    .limit(limit);
  if (error) throw new Error("Active alerts are unavailable.");
  return (data ?? []).map(mapAlert);
}
export async function acknowledgeHistory(userId: string, id: string) {
  const { error } = await getSupabaseAdmin()
    .from("alert_history")
    .update({ acknowledged_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Could not acknowledge alert event.");
}
