import "server-only";
import {
  getLatestMarketIntelligence,
  getMarketIntelligenceByInstrument,
} from "@/lib/market";
import type { MarketIntelligenceRecord } from "@/types/market-intelligence";
import type { RetrievalDocument } from "@/types/ai-context";

const document = (
  item: MarketIntelligenceRecord,
  relevance: number,
): RetrievalDocument => ({
  sourceType: "market_intelligence",
  sourceId: item.id,
  title: `${item.instrumentName} editorial market outlook`,
  content: [
    `Symbol: ${item.symbol}. Valid for: ${item.validForDate}. Editorial bias: ${item.bias}.`,
    item.shortSummary,
    `Technical overview: ${item.technicalOverview}`,
    `Support: ${item.supportLevels.map((level) => level.value).join(", ") || "not supplied"}.`,
    `Resistance: ${item.resistanceLevels.map((level) => level.value).join(", ") || "not supplied"}.`,
    `Bullish scenario: ${item.bullishScenario}`,
    `Bearish scenario: ${item.bearishScenario}`,
    `Primary risks: ${item.riskFactors.join("; ") || "not supplied"}.`,
  ].join("\n"),
  url: item.relatedArticleSlug
    ? `/analysis/${item.relatedArticleSlug}`
    : "/analysis",
  timestamp: item.publishedAt ?? item.updatedAt,
  premium: false,
  delayed: false,
  fixture: false,
  relevance,
});

export async function retrieveMarketIntelligence(
  instrumentSlug: string | null,
) {
  if (instrumentSlug) {
    const item = await getMarketIntelligenceByInstrument(instrumentSlug);
    return item ? [document(item, 95)] : [];
  }
  return (await getLatestMarketIntelligence({ limit: 4 })).map((item, index) =>
    document(item, 70 - index),
  );
}
