import { describe, expect, it } from "vitest";
import {
  isAlpacaResearchSymbol,
  normalizeAlpacaBars,
} from "./alpacaHistoricalMapper";

describe("Alpaca historical data normalization", () => {
  it("allows only the bounded research universe", () => {
    expect(isAlpacaResearchSymbol("SPY")).toBe(true);
    expect(isAlpacaResearchSymbol("AAPL")).toBe(false);
  });

  it("normalizes, sorts, and deduplicates valid daily bars", () => {
    const bars = normalizeAlpacaBars([
      { t: "2026-01-03T05:00:00Z", o: 11, h: 13, l: 10, c: 12, v: 120 },
      { t: "2026-01-02T05:00:00Z", o: 10, h: 12, l: 9, c: 11, v: 100 },
      { t: "2026-01-02T05:00:00Z", o: 10, h: 12, l: 9, c: 11, v: 100 },
    ]);
    expect(bars).toHaveLength(2);
    expect(bars.map((bar) => bar.close)).toEqual([11, 12]);
  });

  it("drops malformed or inconsistent provider bars", () => {
    expect(
      normalizeAlpacaBars([
        { t: "bad", o: 10, h: 12, l: 9, c: 11 },
        { t: "2026-01-02T05:00:00Z", o: 10, h: 9, l: 8, c: 11 },
      ]),
    ).toEqual([]);
  });
});
