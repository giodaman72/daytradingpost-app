import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { MarketQuote } from "@/types/market-data";

export async function storeMarketDataSnapshots(quotes: MarketQuote[]) {
  const approved = quotes.filter(
    (quote) =>
      !quote.simulated && quote.price && quote.provider !== "unconfigured",
  );
  if (!approved.length) return;
  try {
    const { error } = await getSupabaseAdmin()
      .from("market_data_snapshots")
      .insert(
        approved.map((quote) => ({
          instrument_slug: quote.instrumentSlug,
          symbol: quote.symbol,
          price: quote.price,
          currency: quote.currency,
          previous_close: quote.previousClose,
          change: quote.change,
          change_percent: quote.changePercent,
          day_high: quote.dayHigh,
          day_low: quote.dayLow,
          market_status: quote.marketStatus,
          provider: quote.provider,
          provider_timestamp: quote.providerTimestamp,
          received_at: quote.receivedAt,
          delayed: quote.delayed,
          delay_minutes: quote.delayMinutes,
        })),
      );
    if (error) console.warn("Market-data snapshot write skipped:", error.code);
  } catch {
    console.warn("Market-data snapshot cache is unavailable.");
  }
}
