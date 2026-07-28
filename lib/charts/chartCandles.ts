import type { ChartCandle } from "@/types/chart";

export function normalizeCandles(candles: ChartCandle[]) {
  const unique = new Map<number, ChartCandle>();
  for (const candle of candles) {
    if (
      !Number.isFinite(candle.timestamp) ||
      ![candle.open, candle.high, candle.low, candle.close].every(
        Number.isFinite,
      ) ||
      candle.high < Math.max(candle.open, candle.close, candle.low) ||
      candle.low > Math.min(candle.open, candle.close, candle.high)
    )
      continue;
    unique.set(candle.timestamp, candle);
  }
  return [...unique.values()].sort((a, b) => a.timestamp - b.timestamp);
}
