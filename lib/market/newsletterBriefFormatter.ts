import { buildMarketBrief } from "./marketIntelligenceTransforms";
import type { MarketIntelligenceRecord } from "@/types/market-intelligence";

export function formatMarketBriefForNewsletter(
  records: MarketIntelligenceRecord[],
  baseUrl: string,
) {
  const brief = buildMarketBrief(records);
  return {
    headline: brief.headline,
    date: brief.date,
    summary: brief.summary,
    featuredOutlooks: brief.outlooks
      .filter((item) => item.isFeatured)
      .map((item) => ({
        instrument: item.instrumentName,
        symbol: item.symbol,
        bias: item.bias,
        summary: item.shortSummary,
        articleUrl: item.relatedArticleSlug
          ? `${baseUrl.replace(/\/$/, "")}/analysis/${item.relatedArticleSlug}`
          : null,
      })),
    riskDisclaimer: brief.riskDisclaimer,
  };
}
