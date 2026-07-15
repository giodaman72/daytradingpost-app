export const MARKET_STATUSES = [
  "open",
  "closed",
  "premarket",
  "afterhours",
  "unavailable",
  "unknown",
] as const;

export const MARKET_DATA_FRESHNESS = [
  "fresh",
  "cached",
  "stale",
  "simulated",
  "unavailable",
] as const;

export type MarketStatus = (typeof MARKET_STATUSES)[number];
export type MarketDataFreshness = (typeof MARKET_DATA_FRESHNESS)[number];

export type MarketQuote = {
  instrumentSlug: string;
  symbol: string;
  price: string | null;
  currency: string;
  previousClose: string | null;
  change: string | null;
  changePercent: string | null;
  dayHigh: string | null;
  dayLow: string | null;
  marketStatus: MarketStatus;
  providerTimestamp: string | null;
  receivedAt: string;
  provider: string;
  delayed: boolean;
  delayMinutes: number | null;
  freshness: MarketDataFreshness;
  simulated: boolean;
  disclosure: string;
};

export type MarketDataResponse = {
  data: MarketQuote[];
  meta: {
    count: number;
    generatedAt: string;
    provider: string;
    delayed: boolean;
    simulated: boolean;
  };
};

export type MarketDataHealth = {
  configured: boolean;
  healthy: boolean;
  provider: string;
  checkedAt: string;
  message: string;
};

export type ProviderQuotePayload = {
  symbol?: unknown;
  price?: unknown;
  currency?: unknown;
  previousClose?: unknown;
  change?: unknown;
  changePercent?: unknown;
  dayHigh?: unknown;
  dayLow?: unknown;
  marketStatus?: unknown;
  providerTimestamp?: unknown;
  delayed?: unknown;
  delayMinutes?: unknown;
};
