import { describe, expect, it } from "vitest";
import { developmentEconomicCalendarProvider } from "./economicCalendarProvider";

describe("economic calendar provider contract", () => {
  it("returns normalized, explicitly marked development fixtures", async () => {
    const events = await developmentEconomicCalendarProvider.getEvents(
      "2026-07-14",
      "2026-07-15",
    );
    expect(events[0]).toMatchObject({
      currency: "USD",
      impact: "high",
      isFixture: true,
    });
  });
});
