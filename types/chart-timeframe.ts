export const CHART_TIMEFRAMES = [
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1d",
  "1w",
  "1M",
] as const;

export type ChartTimeframe = (typeof CHART_TIMEFRAMES)[number];
