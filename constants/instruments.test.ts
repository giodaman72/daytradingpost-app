import { describe, expect, it } from "vitest";
import {
  getInstrument,
  getProviderSymbol,
  getHomepageInstruments,
  INSTRUMENTS,
} from "./instruments";

describe("instrument registry", () => {
  it("has unique slugs and symbols", () => {
    expect(new Set(INSTRUMENTS.map((item) => item.slug)).size).toBe(
      INSTRUMENTS.length,
    );
    expect(new Set(INSTRUMENTS.map((item) => item.symbol)).size).toBe(
      INSTRUMENTS.length,
    );
  });
  it("normalizes slash-delimited symbols", () =>
    expect(getInstrument("XAU/USD")?.slug).toBe("gold"));
  it("returns null for unsupported instruments", () =>
    expect(getInstrument("FAKE123")).toBeNull());
  it("maps every supported instrument to provider symbols", () => {
    expect(INSTRUMENTS).toHaveLength(14);
    for (const instrument of INSTRUMENTS) {
      expect(getProviderSymbol(instrument, "development")).toBe(
        instrument.symbol,
      );
      expect(instrument.decimalPrecision).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("homepage markets", () => {
  it("retains the original markets and includes the dollar index and three currency pairs", () => {
    const markets = getHomepageInstruments();
    expect(markets.map((item) => item.slug)).toEqual([
      "gold",
      "silver",
      "copper",
      "nasdaq-100",
      "sp-500",
      "dow-jones",
      "wti-crude-oil",
      "natural-gas",
      "dollar-index",
      "eurusd",
      "gbpusd",
      "usdjpy",
    ]);
    expect(new Set(markets.map((item) => item.slug)).size).toBe(markets.length);
  });
  it("resolves the dollar index by its canonical slug and DXY symbol", () => {
    expect(getInstrument("DXY")).toEqual(getInstrument("dollar-index"));
    expect(getInstrument("DXY")).toMatchObject({
      tradingViewSymbol: "INDEX:DXY",
      chartAvailable: true,
    });
  });
});
