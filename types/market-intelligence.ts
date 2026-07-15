export const MARKET_BIASES = [
  "bullish",
  "bearish",
  "neutral",
  "mixed",
] as const;
export const ASSET_CLASSES = [
  "commodities",
  "indices",
  "forex",
  "crypto",
] as const;
export const MOMENTUM_STATES = [
  "positive",
  "negative",
  "neutral",
  "mixed",
] as const;
export const VOLATILITY_STATES = ["low", "moderate", "high"] as const;

export type MarketBias = (typeof MARKET_BIASES)[number];
export type AssetClass = (typeof ASSET_CLASSES)[number];
export type MomentumState = (typeof MOMENTUM_STATES)[number];
export type VolatilityState = (typeof VOLATILITY_STATES)[number];

export type MarketLevel = { label?: string; value: string };

export type MarketIntelligenceRecord = {
  id: string;
  instrumentSlug: string;
  symbol: string;
  instrumentName: string;
  assetClass: AssetClass;
  bias: MarketBias;
  shortSummary: string;
  technicalOverview: string;
  supportLevels: MarketLevel[];
  resistanceLevels: MarketLevel[];
  momentum: MomentumState;
  volatility: VolatilityState;
  bullishScenario: string;
  bearishScenario: string;
  riskFactors: string[];
  relatedArticleSlug: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  validForDate: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MarketIntelligenceSummary = Pick<
  MarketIntelligenceRecord,
  | "id"
  | "instrumentSlug"
  | "symbol"
  | "instrumentName"
  | "assetClass"
  | "bias"
  | "shortSummary"
  | "supportLevels"
  | "resistanceLevels"
  | "momentum"
  | "volatility"
  | "relatedArticleSlug"
  | "isFeatured"
  | "validForDate"
  | "publishedAt"
  | "updatedAt"
>;

export type MarketIntelligenceFilters = {
  date?: string;
  assetClass?: AssetClass;
  featured?: boolean;
  limit?: number;
};

export type MarketIntelligenceResponse = {
  data: MarketIntelligenceSummary[];
  meta: { count: number; generatedAt: string; sampleData: false };
};

export type MarketBrief = {
  date: string;
  headline: string;
  summary: string;
  outlooks: MarketIntelligenceSummary[];
  distribution: { bullish: number; bearish: number; neutralOrMixed: number };
  lastUpdated: string | null;
  riskDisclaimer: string;
};
