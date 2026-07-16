import { describe, expect, it } from "vitest";
import { developmentEconomicProvider } from "./providers/developmentProvider";
import { calculateEconomicStatistics } from "./economicStatistics";

describe("economic statistics", () => {
  it("counts impact, date, country and currency coverage", async () => {
    const now = new Date("2026-07-15T12:00:00Z");
    const events = await developmentEconomicProvider.getWeek(
      now,
      "America/New_York",
    );
    const statistics = calculateEconomicStatistics(
      events,
      now,
      "America/New_York",
    );
    expect(statistics.todayHighImpact).toBeGreaterThan(0);
    expect(statistics.thisWeek).toBe(events.length);
    expect(statistics.countriesCovered).toBeGreaterThan(1);
    expect(statistics.currenciesCovered).toBeGreaterThan(1);
  });
});
