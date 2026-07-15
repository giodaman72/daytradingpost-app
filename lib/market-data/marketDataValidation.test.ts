import { describe, expect, it } from "vitest";
import { INSTRUMENTS } from "@/constants/instruments";
import {
  MAX_BATCH_INSTRUMENTS,
  parseInstrumentList,
} from "./marketDataValidation";

describe("market-data request validation", () => {
  it("accepts registry instruments and removes duplicates", () => {
    const parsed = parseInstrumentList("gold,XAUUSD,bitcoin");
    expect(parsed.valid).toBe(true);
    expect(parsed.instruments.map((item) => item.slug)).toEqual([
      "gold",
      "bitcoin",
    ]);
  });

  it("rejects unsupported instruments and oversized batches", () => {
    expect(parseInstrumentList("made-up").valid).toBe(false);
    const oversized = [
      ...INSTRUMENTS.slice(0, MAX_BATCH_INSTRUMENTS).map((item) => item.slug),
      "extra",
    ].join(",");
    expect(parseInstrumentList(oversized)).toMatchObject({ valid: false });
  });
});
