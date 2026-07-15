import { describe, expect, it } from "vitest";
import {
  normalizeLevels,
  parseMarketIntelligenceFilters,
  validateMarketIntelligence,
} from "./marketIntelligenceValidation";

const validInput = {
  instrumentSlug: "gold",
  symbol: "XAUUSD",
  instrumentName: "Gold",
  assetClass: "commodities" as const,
  bias: "bullish" as const,
  shortSummary:
    "A sufficiently detailed editorial outlook for the selected market.",
  technicalOverview:
    "A sufficiently detailed technical overview for editorial publishing.",
  supportLevels: [{ value: "Editorial support" }],
  resistanceLevels: [{ value: "Editorial resistance" }],
  momentum: "positive" as const,
  volatility: "moderate" as const,
  bullishScenario:
    "A sufficiently detailed bullish scenario for editorial publishing.",
  bearishScenario:
    "A sufficiently detailed bearish scenario for editorial publishing.",
  riskFactors: ["Macro surprise"],
  relatedArticleSlug: "gold-outlook",
  isFeatured: true,
  isPublished: true,
  validForDate: "2026-07-14",
};

describe("market intelligence validation", () => {
  it("accepts a normalized valid record", () =>
    expect(validateMarketIntelligence(validInput).valid).toBe(true));
  it("rejects unsupported instruments and missing scenarios", () => {
    const result = validateMarketIntelligence({
      ...validInput,
      instrumentSlug: "unknown",
      bullishScenario: "",
    });
    expect(result.errors).toMatchObject({
      instrumentSlug: expect.any(String),
      bullishScenario: expect.any(String),
    });
  });
  it("normalizes comma and newline separated levels", () =>
    expect(normalizeLevels("A, B\nC")).toEqual([
      { value: "A" },
      { value: "B" },
      { value: "C" },
    ]));
  it("parses bounded public API filters", () => {
    const result = parseMarketIntelligenceFilters(
      new URLSearchParams("assetClass=crypto&featured=true&limit=4"),
    );
    expect(result).toMatchObject({
      valid: true,
      filters: { assetClass: "crypto", featured: true, limit: 4 },
    });
  });
  it("rejects invalid API filters", () =>
    expect(
      parseMarketIntelligenceFilters(
        new URLSearchParams("date=tomorrow&limit=500"),
      ).errors,
    ).toHaveLength(2));
});
