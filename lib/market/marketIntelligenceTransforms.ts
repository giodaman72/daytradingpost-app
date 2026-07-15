import type {
  MarketBrief,
  MarketIntelligenceRecord,
  MarketIntelligenceSummary,
  MarketIntelligenceResponse,
} from "@/types/market-intelligence";

export const EDUCATIONAL_RISK_DISCLAIMER =
  "Editorial market outlooks are educational information, not live prices, investment advice, or personalized trade signals. Verify current conditions independently and never risk capital you cannot afford to lose.";

export function summarizeMarketIntelligence(
  record: MarketIntelligenceRecord,
): MarketIntelligenceSummary {
  return {
    id: record.id,
    instrumentSlug: record.instrumentSlug,
    symbol: record.symbol,
    instrumentName: record.instrumentName,
    assetClass: record.assetClass,
    bias: record.bias,
    shortSummary: record.shortSummary,
    supportLevels: record.supportLevels,
    resistanceLevels: record.resistanceLevels,
    momentum: record.momentum,
    volatility: record.volatility,
    relatedArticleSlug: record.relatedArticleSlug,
    isFeatured: record.isFeatured,
    validForDate: record.validForDate,
    publishedAt: record.publishedAt,
    updatedAt: record.updatedAt,
  };
}

export function formatMarketIntelligenceResponse(
  records: MarketIntelligenceRecord[],
  generatedAt = new Date().toISOString(),
): MarketIntelligenceResponse {
  const data = records.map(summarizeMarketIntelligence);
  return { data, meta: { count: data.length, generatedAt, sampleData: false } };
}

export function calculateBiasDistribution(
  records: Pick<MarketIntelligenceRecord, "bias">[],
) {
  return records.reduce(
    (result, item) => {
      if (item.bias === "bullish") result.bullish++;
      else if (item.bias === "bearish") result.bearish++;
      else result.neutralOrMixed++;
      return result;
    },
    { bullish: 0, bearish: 0, neutralOrMixed: 0 },
  );
}

export function buildMarketBrief(
  records: MarketIntelligenceRecord[],
  date = new Date().toISOString().slice(0, 10),
): MarketBrief {
  const published = records.filter((item) => item.isPublished);
  const outlooks = published.map(summarizeMarketIntelligence);

  return {
    date,
    headline: `Daily Market Brief — ${date}`,
    summary: outlooks.length
      ? `${outlooks.length} published editorial outlook${outlooks.length === 1 ? "" : "s"} for the current briefing.`
      : "No published market outlooks are available for this briefing.",
    outlooks,
    distribution: calculateBiasDistribution(published),
    lastUpdated:
      outlooks
        .map((item) => item.updatedAt)
        .sort()
        .at(-1) ?? null,
    riskDisclaimer: EDUCATIONAL_RISK_DISCLAIMER,
  };
}
