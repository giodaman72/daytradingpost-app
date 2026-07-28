import type { ChartTimeframe } from "./chart-timeframe";

export type ChartProviderId = "tradingview" | "first_party" | "development";
export type ChartCandle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
  source: string;
  delayed: boolean;
  fixture: boolean;
  receivedAt: string;
};
export type ChartBarsResponse = {
  data: ChartCandle[];
  meta: {
    instrument: string;
    timeframe: ChartTimeframe;
    delayed: boolean;
    fixture: boolean;
    source: string;
    marketStatus: string;
    generatedAt: string;
  };
};
export type ChartAnnotation = {
  id: string;
  kind:
    | "support"
    | "resistance"
    | "bullish_target"
    | "bearish_target"
    | "invalidation"
    | "economic_event"
    | "alert";
  label: string;
  value: number | null;
  timestamp: string | null;
  sourceId: string;
  sourceType: "market_intelligence" | "article" | "economic_event" | "alert";
  premium: boolean;
};
