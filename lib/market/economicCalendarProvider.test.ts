import { describe, expect, it } from "vitest";
import { developmentEconomicCalendarProvider } from "./economicCalendarProvider";

describe("economic calendar provider contract", () => {
  it("returns normalized, explicitly marked development fixtures", async () => {
    const events = await developmentEconomicCalendarProvider.getEvents({
      from: "2026-07-13T00:00:00.000Z",
      to: "2026-07-19T23:59:59.999Z",
    });
    expect(events[0]).toMatchObject({
      isFixture: true,
      source: "DayTradingPost simulated development calendar",
    });
  });
});
