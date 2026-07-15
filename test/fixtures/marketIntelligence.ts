import type { MarketIntelligenceRecord } from "@/types/market-intelligence";

export function marketIntelligenceFixture(
  overrides: Partial<MarketIntelligenceRecord> = {},
): MarketIntelligenceRecord {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    instrumentSlug: "gold",
    symbol: "XAUUSD",
    instrumentName: "Gold",
    assetClass: "commodities",
    bias: "bullish",
    shortSummary:
      "Gold holds an editorially identified support zone while momentum remains constructive.",
    technicalOverview:
      "Price structure is described from the editorial snapshot without claiming current or live market conditions.",
    supportLevels: [{ value: "Editorial level A" }],
    resistanceLevels: [{ value: "Editorial level B" }],
    momentum: "positive",
    volatility: "moderate",
    bullishScenario:
      "A sustained move through the editorial resistance zone would support the bullish scenario.",
    bearishScenario:
      "A sustained break below the editorial support zone would invalidate the bullish scenario.",
    riskFactors: [
      "Central-bank communication",
      "Unexpected geopolitical developments",
    ],
    relatedArticleSlug: "gold-daily-outlook",
    isFeatured: true,
    isPublished: true,
    validForDate: "2026-07-14",
    publishedAt: "2026-07-14T10:00:00.000Z",
    createdAt: "2026-07-14T09:00:00.000Z",
    updatedAt: "2026-07-14T10:00:00.000Z",
    ...overrides,
  };
}
