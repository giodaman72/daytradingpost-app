import {
  MARKET_STATUSES,
  type MarketDataFreshness,
  type MarketDataResponse,
  type MarketQuote,
  type ProviderQuotePayload,
} from "@/types/market-data";
import type { InstrumentDefinition } from "@/constants/instruments";

const DECIMAL = /^-?\d+(?:\.\d+)?$/;

export function parseDecimal(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const normalized = String(value).trim().replaceAll(",", "");
  if (!DECIMAL.test(normalized)) return null;
  const [whole, fraction] = normalized.split(".");
  const cleanWhole = whole.replace(/^(-?)0+(?=\d)/, "$1");
  return fraction === undefined
    ? cleanWhole
    : `${cleanWhole}.${fraction.replace(/0+$/, "") || "0"}`;
}

export function classifyFreshness({
  simulated,
  unavailable,
  delayed,
  providerTimestamp,
  now = Date.now(),
  staleAfterSeconds = 120,
}: {
  simulated: boolean;
  unavailable?: boolean;
  delayed: boolean;
  providerTimestamp: string | null;
  now?: number;
  staleAfterSeconds?: number;
}): MarketDataFreshness {
  if (unavailable) return "unavailable";
  if (simulated) return "simulated";
  if (!providerTimestamp) return "stale";
  const age = now - Date.parse(providerTimestamp);
  if (!Number.isFinite(age) || age > staleAfterSeconds * 1000) return "stale";
  return delayed ? "cached" : "fresh";
}

export function unavailableQuote(
  instrument: InstrumentDefinition,
  provider = "unconfigured",
  message = "Market data is currently unavailable.",
): MarketQuote {
  return {
    instrumentSlug: instrument.slug,
    symbol: instrument.symbol,
    price: null,
    currency: instrument.quoteCurrency,
    previousClose: null,
    change: null,
    changePercent: null,
    dayHigh: null,
    dayLow: null,
    marketStatus: "unavailable",
    providerTimestamp: null,
    receivedAt: new Date().toISOString(),
    provider,
    delayed: false,
    delayMinutes: null,
    freshness: "unavailable",
    simulated: false,
    disclosure: message,
  };
}

export function normalizeProviderQuote({
  instrument,
  payload,
  provider,
  simulated = false,
  receivedAt = new Date().toISOString(),
  staleAfterSeconds = 120,
}: {
  instrument: InstrumentDefinition;
  payload: ProviderQuotePayload;
  provider: string;
  simulated?: boolean;
  receivedAt?: string;
  staleAfterSeconds?: number;
}): MarketQuote | null {
  const price = parseDecimal(payload.price);
  const providerTimestamp =
    typeof payload.providerTimestamp === "string" &&
    Number.isFinite(Date.parse(payload.providerTimestamp))
      ? new Date(payload.providerTimestamp).toISOString()
      : null;
  const status =
    typeof payload.marketStatus === "string" &&
    MARKET_STATUSES.includes(
      payload.marketStatus as MarketQuote["marketStatus"],
    )
      ? (payload.marketStatus as MarketQuote["marketStatus"])
      : "unknown";
  if (!price || !providerTimestamp) return null;
  const delayed = payload.delayed === true;
  const delayMinutes =
    typeof payload.delayMinutes === "number" &&
    Number.isFinite(payload.delayMinutes) &&
    payload.delayMinutes >= 0
      ? Math.round(payload.delayMinutes)
      : null;
  const freshness = classifyFreshness({
    simulated,
    delayed,
    providerTimestamp,
    now: Date.parse(receivedAt),
    staleAfterSeconds,
  });
  return {
    instrumentSlug: instrument.slug,
    symbol: instrument.symbol,
    price,
    currency:
      typeof payload.currency === "string" && payload.currency.trim()
        ? payload.currency.trim().toUpperCase()
        : instrument.quoteCurrency,
    previousClose: parseDecimal(payload.previousClose),
    change: parseDecimal(payload.change),
    changePercent: parseDecimal(payload.changePercent),
    dayHigh: parseDecimal(payload.dayHigh),
    dayLow: parseDecimal(payload.dayLow),
    marketStatus: status,
    providerTimestamp,
    receivedAt,
    provider,
    delayed,
    delayMinutes,
    freshness,
    simulated,
    disclosure: simulated
      ? "Simulated development fixture — not live or delayed market data."
      : delayed
        ? `Provider-delayed data${delayMinutes ? ` by approximately ${delayMinutes} minutes` : ""}.`
        : freshness === "fresh"
          ? "Provider quote received recently; exchange real-time status is not claimed."
          : "Cached or stale provider data. Verify current conditions independently.",
  };
}

export function formatMarketDataResponse(
  data: MarketQuote[],
  generatedAt = new Date().toISOString(),
): MarketDataResponse {
  return {
    data,
    meta: {
      count: data.length,
      generatedAt,
      provider: data[0]?.provider ?? "unconfigured",
      delayed: data.some((quote) => quote.delayed),
      simulated: data.some((quote) => quote.simulated),
    },
  };
}

export function providerFailureFallback(
  instruments: InstrumentDefinition[],
  staleQuotes: MarketQuote[] | null,
  provider: string,
) {
  return (
    staleQuotes ??
    instruments.map((instrument) =>
      unavailableQuote(
        instrument,
        provider,
        "Market-data provider request failed.",
      ),
    )
  );
}
