import "server-only";
import type { ChartProviderId } from "@/types/chart";
import { isChartTimeframe } from "./chartTimeframes";

const integer = (
  value: string | undefined,
  fallback: number,
  minimum: number,
) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum ? parsed : fallback;
};
export function getChartConfig() {
  const requested = process.env.CHART_PROVIDER?.trim();
  const tradingViewEnabled =
    process.env.NEXT_PUBLIC_TRADINGVIEW_WIDGETS_ENABLED !== "false";
  let provider: ChartProviderId =
    requested === "tradingview" ||
    requested === "first_party" ||
    (requested === "development" && process.env.NODE_ENV !== "production")
      ? requested
      : "tradingview";
  if (provider === "tradingview" && !tradingViewEnabled)
    provider = "first_party";
  const timeframe = process.env.CHART_DEFAULT_TIMEFRAME?.trim() ?? "1h";
  return {
    provider,
    defaultTimeframe: isChartTimeframe(timeframe) ? timeframe : "1h",
    maximumBars: integer(process.env.CHART_MAX_BARS_PER_REQUEST, 500, 10),
    maximumHistoryDays: integer(process.env.CHART_MAX_HISTORY_DAYS, 365, 1),
    cacheTtlSeconds: integer(process.env.CHART_CACHE_TTL_SECONDS, 60, 1),
    scriptTimeoutMs: integer(
      process.env.CHART_SCRIPT_TIMEOUT_MS,
      10_000,
      1_000,
    ),
    dataTimeoutMs: integer(process.env.CHART_DATA_TIMEOUT_MS, 8_000, 1_000),
    tradingViewEnabled,
  } as const;
}
