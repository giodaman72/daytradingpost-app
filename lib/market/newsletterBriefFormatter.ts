import { buildMarketBrief } from "./marketIntelligenceTransforms";
import type { MarketIntelligenceRecord } from "@/types/market-intelligence";
import type { EconomicEvent } from "@/types/economic-event";
import { describeEventRisk } from "@/lib/economic/economicImpact";

export function formatMarketBriefForNewsletter(
  records: MarketIntelligenceRecord[],
  baseUrl: string,
  economicEvents: EconomicEvent[] = [],
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
    todayEvents: economicEvents.map((event) => ({
      title: event.title,
      currency: event.currency,
      impact: event.impact,
      scheduledTime: event.scheduledTime,
      simulated: event.isFixture,
    })),
    topRisks: economicEvents
      .filter((event) => event.impact === "high")
      .slice(0, 3)
      .map(describeEventRisk),
    marketSummary: economicEvents.length
      ? `${economicEvents.length} scheduled economic release${economicEvents.length === 1 ? "" : "s"} included in this brief.`
      : "No verified economic events are available for this brief.",
  };
}
