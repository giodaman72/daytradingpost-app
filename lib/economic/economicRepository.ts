import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { EconomicEvent } from "@/types/economic-event";

type EconomicEventRow = {
  id: string;
  provider_event_id: string;
  title: string;
  description: string | null;
  country: EconomicEvent["country"];
  country_name: string;
  currency: EconomicEvent["currency"];
  impact: EconomicEvent["impact"];
  scheduled_time: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  revised: string | null;
  event_type: string;
  category: string;
  source: string;
  status: EconomicEvent["status"];
  is_fixture: boolean;
  historical_values: EconomicEvent["historicalValues"] | null;
  related_markets: string[] | null;
  educational_explanation: string | null;
  trading_considerations: string[] | null;
  created_at: string;
  updated_at: string;
};

export function mapEconomicEventRow(row: EconomicEventRow): EconomicEvent {
  return {
    id: row.id,
    providerEventId: row.provider_event_id,
    title: row.title,
    description: row.description,
    country: row.country,
    countryName: row.country_name,
    currency: row.currency,
    impact: row.impact,
    scheduledTime: row.scheduled_time,
    forecast: row.forecast,
    previous: row.previous,
    actual: row.actual,
    revised: row.revised,
    eventType: row.event_type,
    category: row.category,
    source: row.source,
    status: row.status,
    isFixture: row.is_fixture,
    historicalValues: row.historical_values ?? [],
    relatedMarkets: row.related_markets ?? [],
    educationalExplanation: row.educational_explanation,
    tradingConsiderations: row.trading_considerations ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getStoredEconomicEvents(from: string, to: string) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("economic_events")
      .select("*")
      .gte("scheduled_time", from)
      .lte("scheduled_time", to)
      .eq("is_fixture", false)
      .order("scheduled_time");
    if (error) throw error;
    return ((data ?? []) as EconomicEventRow[]).map(mapEconomicEventRow);
  } catch (error) {
    console.warn(
      "Economic event storage unavailable:",
      error instanceof Error ? error.message : "unknown error",
    );
    return [];
  }
}

export async function getStoredEconomicEvent(id: string) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("economic_events")
      .select("*")
      .eq("id", id)
      .eq("is_fixture", false)
      .maybeSingle();
    if (error) throw error;
    return data ? mapEconomicEventRow(data as EconomicEventRow) : null;
  } catch {
    return null;
  }
}
