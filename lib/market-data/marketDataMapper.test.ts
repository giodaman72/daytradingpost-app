import { describe, expect, it } from "vitest";
import { getInstrument } from "@/constants/instruments";
import {
  classifyFreshness,
  formatMarketDataResponse,
  normalizeProviderQuote,
  parseDecimal,
  providerFailureFallback,
} from "./marketDataMapper";

const gold = getInstrument("gold")!;
const timestamp = "2026-07-14T12:00:00.000Z";

describe("market-data normalization", () => {
  it("normalizes decimal and percentage strings without adding binary-float output", () => {
    expect(parseDecimal("01,234.5000")).toBe("1234.5");
    expect(parseDecimal("-0.1250")).toBe("-0.125");
    expect(parseDecimal("not-a-price")).toBeNull();
  });

  it("normalizes a valid provider quote", () => {
    const quote = normalizeProviderQuote({
      instrument: gold,
      provider: "test",
      receivedAt: timestamp,
      payload: {
        price: "2400.00",
        change: "7.50",
        changePercent: "0.3135",
        providerTimestamp: timestamp,
        marketStatus: "open",
      },
    });
    expect(quote).toMatchObject({
      instrumentSlug: "gold",
      price: "2400.0",
      changePercent: "0.3135",
      marketStatus: "open",
      freshness: "fresh",
    });
  });

  it("rejects malformed required provider fields", () => {
    expect(
      normalizeProviderQuote({
        instrument: gold,
        provider: "test",
        payload: { price: "bad", providerTimestamp: timestamp },
      }),
    ).toBeNull();
  });

  it("classifies delayed and stale timestamps", () => {
    expect(
      classifyFreshness({
        simulated: false,
        delayed: true,
        providerTimestamp: timestamp,
        now: Date.parse(timestamp),
      }),
    ).toBe("cached");
    expect(
      classifyFreshness({
        simulated: false,
        delayed: false,
        providerTimestamp: timestamp,
        now: Date.parse(timestamp) + 121_000,
      }),
    ).toBe("stale");
  });

  it("formats the stable public API envelope", () => {
    const fallback = providerFailureFallback([gold], null, "test");
    expect(formatMarketDataResponse(fallback, timestamp)).toMatchObject({
      data: [{ instrumentSlug: "gold", freshness: "unavailable" }],
      meta: { count: 1, provider: "test", generatedAt: timestamp },
    });
  });

  it("prefers stale cache during provider failure", () => {
    const stale = providerFailureFallback([gold], null, "test").map(
      (quote) => ({
        ...quote,
        price: "2399.0",
        freshness: "stale" as const,
      }),
    );
    expect(providerFailureFallback([gold], stale, "test")).toBe(stale);
  });
});
