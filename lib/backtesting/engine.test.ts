import { describe, expect, it } from "vitest";
import { createSyntheticDailyCsv, parsePriceBarsCsv } from "./csv";
import {
  DEFAULT_TREND_CONFIG,
  runTrendBacktest,
  validateTrendConfig,
} from "./engine";

describe("quant research backtest", () => {
  it("parses, sorts, and validates OHLC CSV", () => {
    const bars = parsePriceBarsCsv(
      "date,open,high,low,close\n2026-01-02,10,12,9,11\n2026-01-01,9,11,8,10",
    );
    expect(bars.map((bar) => bar.close)).toEqual([10, 11]);
    expect(() =>
      parsePriceBarsCsv("date,open,high,low,close\n2026-01-01,10,9,8,11"),
    ).toThrow(/inconsistent OHLC/);
  });

  it("runs deterministically with costs and bounded position sizing", () => {
    const bars = parsePriceBarsCsv(createSyntheticDailyCsv());
    const first = runTrendBacktest(bars);
    const second = runTrendBacktest(bars);
    expect(second).toEqual(first);
    expect(first.metrics.tradeCount).toBeGreaterThan(0);
    expect(first.metrics.endingEquity).toBeGreaterThan(0);
    expect(first.equityCurve).toHaveLength(bars.length);
    expect(first.trades.every((trade) => trade.quantity > 0)).toBe(true);
  });

  it("makes explicit costs reduce results", () => {
    const bars = parsePriceBarsCsv(createSyntheticDailyCsv());
    const withoutCosts = runTrendBacktest(bars, {
      ...DEFAULT_TREND_CONFIG,
      feeBps: 0,
      slippageBps: 0,
    });
    const withCosts = runTrendBacktest(bars, {
      ...DEFAULT_TREND_CONFIG,
      feeBps: 25,
      slippageBps: 25,
    });
    expect(withCosts.metrics.endingEquity).toBeLessThan(
      withoutCosts.metrics.endingEquity,
    );
  });

  it("rejects unsafe or incoherent configuration", () => {
    expect(() =>
      validateTrendConfig({
        ...DEFAULT_TREND_CONFIG,
        fastEmaPeriod: 100,
        slowEmaPeriod: 50,
      }),
    ).toThrow(/fast EMA/);
    expect(() =>
      validateTrendConfig({ ...DEFAULT_TREND_CONFIG, riskPerTradePercent: 11 }),
    ).toThrow(/cannot exceed 10%/);
  });
});
