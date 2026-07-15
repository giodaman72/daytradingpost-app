import { describe, expect, it } from "vitest";
import { getInstrument } from "@/constants/instruments";
import { unavailableQuote } from "./marketDataMapper";
import { MarketDataCache } from "./marketDataCache";

describe("market-data cache", () => {
  it("serves fresh, then stale, then expired entries", () => {
    const gold = getInstrument("gold")!;
    const quote = {
      ...unavailableQuote(gold),
      price: "2400",
      freshness: "fresh" as const,
    };
    const cache = new MarketDataCache(100, 2);
    cache.set([gold.slug], [quote], 1_000);
    expect(cache.getFresh([gold.slug], 1_050)?.[0].price).toBe("2400");
    expect(cache.getFresh([gold.slug], 1_101)).toBeNull();
    expect(cache.getStale([gold.slug], 1_150)?.[0]).toMatchObject({
      price: "2400",
      freshness: "stale",
    });
    expect(cache.getStale([gold.slug], 1_201)).toBeNull();
  });

  it("uses an order-independent cache key", () => {
    const cache = new MarketDataCache(100);
    expect(cache.key(["gold", "bitcoin"])).toBe(cache.key(["bitcoin", "gold"]));
  });
});
