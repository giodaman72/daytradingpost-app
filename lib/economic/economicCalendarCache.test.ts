import { describe, expect, it } from "vitest";
import { EconomicCalendarCache } from "./economicCalendarCache";

describe("economic calendar cache", () => {
  it("expires entries after the configured TTL", () => {
    const cache = new EconomicCalendarCache(100);
    cache.set("week", [], 1_000);
    expect(cache.get("week", 1_099)).toEqual([]);
    expect(cache.get("week", 1_100)).toBeNull();
  });
});
