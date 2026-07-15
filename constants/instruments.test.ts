import { describe, expect, it } from "vitest";
import { getInstrument, INSTRUMENTS } from "./instruments";

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
});
