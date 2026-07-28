import { CHART_TIMEFRAMES, type ChartTimeframe } from "@/types/chart-timeframe";

export const CHART_TIMEFRAME_LABELS: Record<ChartTimeframe, string> = {
  "1m": "1 minute",
  "5m": "5 minutes",
  "15m": "15 minutes",
  "30m": "30 minutes",
  "1h": "1 hour",
  "4h": "4 hours",
  "1d": "1 day",
  "1w": "1 week",
  "1M": "1 month",
};
export const CHART_TIMEFRAME_SECONDS: Record<ChartTimeframe, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "30m": 1_800,
  "1h": 3_600,
  "4h": 14_400,
  "1d": 86_400,
  "1w": 604_800,
  "1M": 2_592_000,
};
export function isChartTimeframe(value: string): value is ChartTimeframe {
  return CHART_TIMEFRAMES.includes(value as ChartTimeframe);
}
export function toTradingViewInterval(timeframe: ChartTimeframe) {
  return {
    "1m": "1",
    "5m": "5",
    "15m": "15",
    "30m": "30",
    "1h": "60",
    "4h": "240",
    "1d": "D",
    "1w": "W",
    "1M": "M",
  }[timeframe];
}
