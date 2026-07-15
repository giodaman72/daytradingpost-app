import { describe, expect, it } from "vitest";
import { getInstrument, getProviderSymbol, INSTRUMENTS } from "./instruments";

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
    expect(INSTRUMENTS).toHaveLength(13);
    for (const instrument of INSTRUMENTS) {
      expect(getProviderSymbol(instrument, "development")).toBe(
        instrument.symbol,
      );
      expect(instrument.decimalPrecision).toBeGreaterThanOrEqual(0);
    }
  });
});
