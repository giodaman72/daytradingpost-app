import type { PriceBar } from "./types";

export const DATABENTO_RESEARCH_SYMBOLS = [
  "ES",
  "NQ",
  "YM",
  "CL",
  "NG",
  "GC",
  "SI",
  "HG",
] as const;

export type DatabentoResearchSymbol =
  (typeof DATABENTO_RESEARCH_SYMBOLS)[number];

export function isDatabentoResearchSymbol(
  value: string,
): value is DatabentoResearchSymbol {
  return DATABENTO_RESEARCH_SYMBOLS.includes(value as DatabentoResearchSymbol);
}

export function toDatabentoContinuousSymbol(symbol: DatabentoResearchSymbol) {
  return `${symbol}.c.0`;
}

function timestampFrom(candidate: Record<string, unknown>) {
  const direct = candidate.ts_event;
  if (typeof direct === "string" && !Number.isNaN(Date.parse(direct)))
    return new Date(direct).toISOString();

  const header = candidate.hd;
  if (header && typeof header === "object") {
    const nested = (header as Record<string, unknown>).ts_event;
    if (typeof nested === "string" && !Number.isNaN(Date.parse(nested)))
      return new Date(nested).toISOString();
  }
  return null;
}

export function normalizeDatabentoJsonLines(payload: string): PriceBar[] {
  const unique = new Map<string, PriceBar>();
  for (const line of payload.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let candidate: unknown;
    try {
      candidate = JSON.parse(line);
    } catch {
      continue;
    }
    if (!candidate || typeof candidate !== "object") continue;
    const record = candidate as Record<string, unknown>;
    const timestamp = timestampFrom(record);
    const open = Number(record.open);
    const high = Number(record.high);
    const low = Number(record.low);
    const close = Number(record.close);
    const volume = Number(record.volume);
    if (
      !timestamp ||
      ![open, high, low, close].every(Number.isFinite) ||
      open <= 0 ||
      high < Math.max(open, close) ||
      low > Math.min(open, close) ||
      high < low
    )
      continue;

    unique.set(timestamp, {
      timestamp,
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
