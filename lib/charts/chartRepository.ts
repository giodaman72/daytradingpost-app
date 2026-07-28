import "server-only";
import { randomBytes } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ChartLayout, ChartPreference } from "@/types/chart-layout";
import { ChartError } from "./chartErrors";

const mapLayout = (row: Record<string, unknown>): ChartLayout => ({
  id: String(row.id),
  name: String(row.name),
  instrumentSlug: String(row.instrument_slug),
  provider: row.provider as ChartLayout["provider"],
  timeframe: row.timeframe as ChartLayout["timeframe"],
  indicators: (row.indicators ?? []) as ChartLayout["indicators"],
  settings: row.settings as ChartLayout["settings"],
  isDefault: Boolean(row.is_default),
  isShared: Boolean(row.is_shared),
  shareId: row.share_id ? String(row.share_id) : null,
  shareExpiresAt: row.share_expires_at ? String(row.share_expires_at) : null,
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at),
});
export async function listChartLayouts(userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("chart_layouts")
    .select()
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error)
    throw new ChartError("INTERNAL_ERROR", "Layouts are unavailable.", 500);
  return (data ?? []).map(mapLayout);
}
export async function getChartLayout(userId: string, id: string) {
  const { data } = await getSupabaseAdmin()
    .from("chart_layouts")
    .select()
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) throw new ChartError("NOT_FOUND", "Chart layout not found.", 404);
  return mapLayout(data);
}
export async function createChartLayout(
  userId: string,
  input: Omit<
    ChartLayout,
    "id" | "shareId" | "isShared" | "shareExpiresAt" | "createdAt" | "updatedAt"
  >,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("chart_layouts")
    .insert({
      user_id: userId,
      name: input.name,
      instrument_slug: input.instrumentSlug,
      provider: input.provider,
      timeframe: input.timeframe,
      indicators: input.indicators,
      settings: input.settings,
      is_default: input.isDefault,
    })
    .select()
    .single();
  if (error)
    throw new ChartError("INTERNAL_ERROR", "Could not save layout.", 500);
  return mapLayout(data);
}
export async function updateChartLayout(
  userId: string,
  id: string,
  input: Omit<
    ChartLayout,
    "id" | "shareId" | "isShared" | "shareExpiresAt" | "createdAt" | "updatedAt"
  >,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("chart_layouts")
    .update({
      name: input.name,
      instrument_slug: input.instrumentSlug,
      provider: input.provider,
      timeframe: input.timeframe,
      indicators: input.indicators,
      settings: input.settings,
      is_default: input.isDefault,
      last_opened_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();
  if (error || !data)
    throw new ChartError("NOT_FOUND", "Chart layout not found.", 404);
  return mapLayout(data);
}
export async function deleteChartLayout(userId: string, id: string) {
  const { error } = await getSupabaseAdmin()
    .from("chart_layouts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error)
    throw new ChartError("INTERNAL_ERROR", "Could not delete layout.", 500);
}
export async function shareChartLayout(userId: string, id: string) {
  await getChartLayout(userId, id);
  const shareId = randomBytes(18).toString("base64url");
  const { data, error } = await getSupabaseAdmin()
    .from("chart_layouts")
    .update({ is_shared: true, share_id: shareId })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error)
    throw new ChartError("INTERNAL_ERROR", "Could not share layout.", 500);
  return mapLayout(data);
}
export async function revokeChartShare(userId: string, id: string) {
  const { error } = await getSupabaseAdmin()
    .from("chart_layouts")
    .update({ is_shared: false, share_id: null, share_expires_at: null })
    .eq("id", id)
    .eq("user_id", userId);
  if (error)
    throw new ChartError("INTERNAL_ERROR", "Could not revoke sharing.", 500);
}
export async function getSharedChartLayout(shareId: string) {
  const { data } = await getSupabaseAdmin()
    .from("chart_layouts")
    .select()
    .eq("share_id", shareId)
    .eq("is_shared", true)
    .maybeSingle();
  if (
    !data ||
    (data.share_expires_at &&
      new Date(String(data.share_expires_at)) <= new Date())
  )
    throw new ChartError("NOT_FOUND", "Shared chart not found.", 404);
  return mapLayout(data);
}
export async function getChartPreference(
  userId: string,
  instrumentSlug: string,
) {
  const { data } = await getSupabaseAdmin()
    .from("chart_preferences")
    .select()
    .eq("user_id", userId)
    .eq("instrument_slug", instrumentSlug)
    .maybeSingle();
  if (!data) return null;
  return {
    instrumentSlug: String(data.instrument_slug),
    preferredProvider: data.preferred_provider,
    preferredTimeframe: data.preferred_timeframe,
    showVolume: Boolean(data.show_volume),
    showEditorialOverlays: Boolean(data.show_editorial_overlays),
    showEconomicEvents: Boolean(data.show_economic_events),
    showAlertLevels: Boolean(data.show_alert_levels),
    theme: data.theme,
    timezone: String(data.timezone),
  } as ChartPreference;
}
export async function saveChartPreference(
  userId: string,
  preference: ChartPreference,
) {
  const { error } = await getSupabaseAdmin().from("chart_preferences").upsert(
    {
      user_id: userId,
      instrument_slug: preference.instrumentSlug,
      preferred_provider: preference.preferredProvider,
      preferred_timeframe: preference.preferredTimeframe,
      show_volume: preference.showVolume,
      show_editorial_overlays: preference.showEditorialOverlays,
      show_economic_events: preference.showEconomicEvents,
      show_alert_levels: preference.showAlertLevels,
      theme: preference.theme,
      timezone: preference.timezone,
    },
    { onConflict: "user_id,instrument_slug" },
  );
  if (error)
    throw new ChartError("INTERNAL_ERROR", "Could not save preferences.", 500);
}
