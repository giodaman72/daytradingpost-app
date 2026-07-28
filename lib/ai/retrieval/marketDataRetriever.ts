import "server-only";
import { getQuoteByInstrument } from "@/lib/market-data/marketDataService";
import type { RetrievalDocument } from "@/types/ai-context";

export async function retrieveMarketData(
  instrumentSlug: string | null,
): Promise<RetrievalDocument[]> {
  if (!instrumentSlug) return [];
  const quote = await getQuoteByInstrument(instrumentSlug);
  if (!quote) return [];
  return [
    {
      sourceType: "market_data",
      sourceId: `${quote.provider}:${quote.instrumentSlug}:${quote.providerTimestamp ?? quote.receivedAt}`,
      title: `${quote.symbol} market-data snapshot`,
      content: [
        `Price: ${quote.price ?? "unavailable"} ${quote.currency}.`,
        `Previous close: ${quote.previousClose ?? "unavailable"}. Change: ${quote.change ?? "unavailable"} (${quote.changePercent ?? "unavailable"}%).`,
        `Market status: ${quote.marketStatus}. Freshness: ${quote.freshness}.`,
        quote.disclosure,
      ].join("\n"),
      url: "/analysis",
      timestamp: quote.providerTimestamp ?? quote.receivedAt,
      premium: false,
      delayed: quote.delayed,
      fixture: quote.simulated,
      relevance: 90,
    },
  ];
}
