export type MarketBias = "Bullish" | "Neutral" | "Bearish";

export type MarketCategory = "commodity" | "crypto" | "forex" | "index";

export type MarketDefinition = {
  category: MarketCategory;
  name: string;
  session: string;
  slug: string;
  symbol: string;
};

export type EconomicEvent = {
  currency: string;
  event: string;
  id: string;
  impact: "High" | "Medium" | "Low";
  time: string;
};

export type MarketSnapshot = {
  bias: MarketBias;
  changePercent?: number;
  price?: number;
  symbol: string;
  updatedAt?: string;
};
