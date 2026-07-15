import type {
  EconomicCalendarEvent,
  EconomicCalendarProvider,
} from "@/types/economic-calendar";

export const developmentEconomicCalendarProvider: EconomicCalendarProvider = {
  async getEvents() {
    if (process.env.NODE_ENV === "production") return [];
    const fixtures: EconomicCalendarEvent[] = [
      {
        id: "fixture-us-cpi",
        title: "Consumer Price Index (development fixture)",
        country: "United States",
        currency: "USD",
        impact: "high",
        scheduledAt: "2026-07-15T12:30:00Z",
        previous: "Fixture",
        forecast: "Fixture",
        actual: null,
        source: "DayTradingPost development fixture",
        isFixture: true,
      },
    ];
    return fixtures;
  },
};
