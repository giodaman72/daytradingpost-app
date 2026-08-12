import type { PriceBar } from "./types";

export const ALPACA_RESEARCH_SYMBOLS = ["SPY", "QQQ", "GLD"] as const;
export type AlpacaResearchSymbol = (typeof ALPACA_RESEARCH_SYMBOLS)[number];

type AlpacaBarPayload = {
  t?: unknown;
  o?: unknown;
  h?: unknown;
  l?: unknown;
  c?: unknown;
  v?: unknown;
};

export function isAlpacaResearchSymbol(
  value: string,
): value is AlpacaResearchSymbol {
  return ALPACA_RESEARCH_SYMBOLS.includes(value as AlpacaResearchSymbol);
}

export function normalizeAlpacaBars(payload: unknown): PriceBar[] {
  if (!Array.isArray(payload)) return [];
  const unique = new Map<string, PriceBar>();

  for (const candidate of payload) {
    if (!candidate || typeof candidate !== "object") continue;
    const bar = candidate as AlpacaBarPayload;
    const timestamp = typeof bar.t === "string" ? bar.t : "";
    const open = Number(bar.o);
    const high = Number(bar.h);
    const low = Number(bar.l);
    const close = Number(bar.c);
    const volume = Number(bar.v);
    if (
      !timestamp ||
      Number.isNaN(Date.parse(timestamp)) ||
      ![open, high, low, close].every(Number.isFinite) ||
      open <= 0 ||
      high < Math.max(open, close) ||
      low > Math.min(open, close) ||
      high < low
    )
      continue;

    const normalizedTimestamp = new Date(timestamp).toISOString();
    unique.set(normalizedTimestamp, {
      timestamp: normalizedTimestamp,
      open,
      high,
      low,
      close,
      volume: Number.isFinite(volume) && volume >= 0 ? volume : undefined,
    });
  }

  return [...unique.values()].sort((left, right) =>
    left.timestamp.localeCompare(right.timestamp),
  );
}
