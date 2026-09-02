import { describe, expect, it } from "vitest";
import {
  DATABENTO_RESEARCH_SYMBOLS,
  isDatabentoResearchSymbol,
  normalizeDatabentoJsonLines,
  toDatabentoContinuousSymbol,
} from "./databentoHistoricalMapper";

describe("Databento historical mapping", () => {
  it("allows the bounded CME research universe", () => {
    expect(DATABENTO_RESEARCH_SYMBOLS).toEqual([
      "ES",
      "NQ",
      "YM",
      "CL",
      "NG",
      "GC",
      "SI",
      "HG",
    ]);
    expect(isDatabentoResearchSymbol("ES")).toBe(true);
    expect(isDatabentoResearchSymbol("AAPL")).toBe(false);
    expect(toDatabentoContinuousSymbol("CL")).toBe("CL.c.0");
  });

  it("normalizes, validates, sorts, and deduplicates JSON lines", () => {
    const bars = normalizeDatabentoJsonLines(
      [
        JSON.stringify({
          ts_event: "2025-01-03T00:00:00Z",
          open: "102",
          high: "105",
          low: "101",
          close: "104",
          volume: 9,
        }),
        "not-json",
        JSON.stringify({
          ts_event: "2025-01-02T00:00:00Z",
          open: 100,
          high: 104,
          low: 99,
          close: 102,
          volume: 12,
        }),
        JSON.stringify({
          ts_event: "2025-01-02T00:00:00Z",
          open: 100,
          high: 104,
          low: 99,
          close: 103,
          volume: 13,
        }),
        JSON.stringify({
          ts_event: "2025-01-04T00:00:00Z",
          open: 100,
          high: 99,
          low: 98,
          close: 101,
        }),
      ].join("\n"),
    );

    expect(bars).toHaveLength(2);
    expect(bars[0]).toMatchObject({ close: 103, volume: 13 });
    expect(bars[1].timestamp).toBe("2025-01-03T00:00:00.000Z");
  });
});
