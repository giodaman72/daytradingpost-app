import { resolveChartSymbol } from "./chartSymbols";
import { isChartTimeframe } from "./chartTimeframes";
import { validateIndicator } from "./chartIndicators";
import { ChartError } from "./chartErrors";
import type { ChartProviderId } from "@/types/chart";
import type { ChartLayout } from "@/types/chart-layout";
import type { ChartPreference } from "@/types/chart-layout";
import type { ChartIndicatorConfig } from "@/types/chart-indicator";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROVIDERS: ChartProviderId[] = [
  "tradingview",
  "first_party",
  "development",
];
const text = (value: unknown, maximum = 120) =>
  typeof value === "string"
    ? value
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maximum)
    : "";

export function parseBarsQuery(
  url: string,
  maximumBars: number,
  maximumDays: number,
) {
  const params = new URL(url).searchParams;
  const instrument = text(params.get("instrument"), 80);
  const timeframe = text(params.get("timeframe"), 10);
  if (
    !isChartTimeframe(timeframe) ||
    !resolveChartSymbol(instrument, timeframe)
  )
    throw new ChartError(
      "INVALID_REQUEST",
      "Unsupported chart symbol or timeframe.",
      400,
    );
  const now = Math.floor(Date.now() / 1000);
  const to = Math.min(now, Number(params.get("to")) || now);
  const from = Math.max(
    to - maximumDays * 86_400,
    Number(params.get("from")) || to - 30 * 86_400,
  );
  const limit = Math.min(
    maximumBars,
    Math.max(10, Number(params.get("limit")) || 200),
  );
  if (!Number.isFinite(from) || !Number.isFinite(to) || from >= to)
    throw new ChartError("INVALID_REQUEST", "Invalid chart range.", 400);
  return { instrument, timeframe, from, to, limit };
}
export function parseLayoutInput(
  input: unknown,
  premium: boolean,
  maximumIndicators: number,
): Omit<
  ChartLayout,
  "id" | "shareId" | "isShared" | "shareExpiresAt" | "createdAt" | "updatedAt"
> {
  if (!input || typeof input !== "object")
    throw new ChartError("INVALID_REQUEST", "Invalid chart layout.", 400);
  const raw = input as Record<string, unknown>;
  const name = text(raw.name);
  const instrumentSlug = text(raw.instrumentSlug, 80);
  const timeframe = text(raw.timeframe, 10);
  const provider = text(raw.provider, 30) as ChartProviderId;
  if (
    !name ||
    !isChartTimeframe(timeframe) ||
    !resolveChartSymbol(instrumentSlug, timeframe) ||
    !PROVIDERS.includes(provider)
  )
    throw new ChartError(
      "INVALID_REQUEST",
      "Invalid chart layout fields.",
      400,
    );
  if (provider === "development" && process.env.NODE_ENV === "production")
    throw new ChartError(
      "INVALID_REQUEST",
      "Development charts are unavailable.",
      400,
    );
  const indicators = Array.isArray(raw.indicators)
    ? raw.indicators
        .slice(0, maximumIndicators + 1)
        .map((item) => validateIndicator(item as ChartIndicatorConfig, premium))
        .filter((item): item is ChartIndicatorConfig => Boolean(item))
    : [];
  if (indicators.length > maximumIndicators)
    throw new ChartError("LIMIT_REACHED", "Too many active indicators.", 403);
  const settings = (raw.settings ?? {}) as Record<string, unknown>;
  return {
    name,
    instrumentSlug,
    timeframe,
    provider,
    indicators,
    settings: {
      showEditorialOverlays: settings.showEditorialOverlays !== false,
      showEconomicEvents: settings.showEconomicEvents === true,
      showAlertLevels: premium && settings.showAlertLevels === true,
      theme: settings.theme === "light" ? "light" : "dark",
    },
    isDefault: raw.isDefault === true,
  };
}
export function requireLayoutId(value: string) {
  if (!UUID.test(value))
    throw new ChartError("INVALID_REQUEST", "Invalid layout.", 400);
  return value;
}

export function parseChartPreference(input: unknown): ChartPreference {
  if (!input || typeof input !== "object")
    throw new ChartError("INVALID_REQUEST", "Invalid chart preferences.", 400);
  const raw = input as Record<string, unknown>;
  const instrumentSlug = text(raw.instrumentSlug, 80);
  const timeframe = text(raw.preferredTimeframe, 10);
  const provider = text(raw.preferredProvider, 30) as ChartProviderId;
  if (
    !isChartTimeframe(timeframe) ||
    !resolveChartSymbol(instrumentSlug, timeframe) ||
    !PROVIDERS.includes(provider)
  )
    throw new ChartError("INVALID_REQUEST", "Invalid chart preferences.", 400);
  return {
    instrumentSlug,
    preferredProvider: provider,
    preferredTimeframe: timeframe,
    showVolume: raw.showVolume !== false,
    showEditorialOverlays: raw.showEditorialOverlays !== false,
    showEconomicEvents: raw.showEconomicEvents === true,
    showAlertLevels: raw.showAlertLevels === true,
    theme: raw.theme === "light" ? "light" : "dark",
    timezone: text(raw.timezone, 100) || "Etc/UTC",
  };
}
