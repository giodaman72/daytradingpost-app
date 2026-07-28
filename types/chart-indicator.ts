export type ChartIndicatorId =
  "sma" | "ema" | "bollinger" | "rsi" | "macd" | "atr" | "volume" | "vwap";
export type ChartIndicatorConfig = {
  id: ChartIndicatorId;
  parameters: Record<string, number>;
};
