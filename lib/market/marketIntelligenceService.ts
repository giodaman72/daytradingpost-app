import "server-only";
import { unstable_cache } from "next/cache";
import { getInstrument } from "@/constants/instruments";
import { MARKET_INTELLIGENCE_CACHE_TAG } from "./marketIntelligenceCache";
import {
  findPublishedIntelligence,
  listPublishedIntelligence,
} from "./marketIntelligenceRepository";
import {
  buildMarketBrief,
  calculateBiasDistribution,
  EDUCATIONAL_RISK_DISCLAIMER,
  summarizeMarketIntelligence,
} from "./marketIntelligenceTransforms";
import type { MarketIntelligenceFilters } from "@/types/market-intelligence";

export {
  buildMarketBrief,
  calculateBiasDistribution,
  EDUCATIONAL_RISK_DISCLAIMER,
};

const cachedLatest = unstable_cache(
  async () => listPublishedIntelligence({ limit: 12 }),
  ["market-intelligence-latest"],
  { revalidate: 300, tags: [MARKET_INTELLIGENCE_CACHE_TAG] },
);
const cachedFeatured = unstable_cache(
  async () => listPublishedIntelligence({ featured: true, limit: 6 }),
  ["market-intelligence-featured"],
  { revalidate: 300, tags: [MARKET_INTELLIGENCE_CACHE_TAG] },
);

export async function getLatestMarketIntelligence(
  filters: MarketIntelligenceFilters = {},
) {
  const records = Object.keys(filters).length
    ? await listPublishedIntelligence(filters)
    : await cachedLatest();
  return records;
}
export async function getFeaturedMarketIntelligence() {
  return cachedFeatured();
}
export async function getMarketIntelligenceByInstrument(value: string) {
  return findPublishedIntelligence(getInstrument(value)?.slug ?? value);
}
export async function getMarketIntelligenceForDate(date: string) {
  return listPublishedIntelligence({ date, limit: 50 });
}
export async function getMarketIntelligenceSummary(
  filters: MarketIntelligenceFilters = {},
) {
  return (await getLatestMarketIntelligence(filters)).map(
    summarizeMarketIntelligence,
  );
}
export async function getDashboardMarketIntelligence(
  watchlistSymbols: string[] = [],
) {
  const records = await getLatestMarketIntelligence({ limit: 12 });
  const normalizedWatchlist = watchlistSymbols.map((symbol) =>
    symbol.replaceAll("/", ""),
  );
  return [...records]
    .sort(
      (a, b) =>
        Number(normalizedWatchlist.includes(b.symbol)) -
          Number(normalizedWatchlist.includes(a.symbol)) ||
        Number(b.isFeatured) - Number(a.isFeatured),
    )
    .slice(0, 6);
}
