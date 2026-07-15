import { describe, expect, it } from "vitest";
import type { EconomicEvent } from "@/types/economic-event";
import {
  economicCountdown,
  filterEconomicEvents,
  formatEconomicResponse,
  formatEconomicTime,
  getEconomicDayRange,
  getEconomicWeekRange,
} from "./economicFilters";

function event(overrides: Partial<EconomicEvent> = {}): EconomicEvent {
  return {
    id: "one",
    providerEventId: "one",
    title: "US CPI",
    description: null,
    country: "US",
    countryName: "United States",
    currency: "USD",
    impact: "high",
    scheduledTime: "2026-07-15T12:30:00.000Z",
    forecast: "0.3%",
    previous: "0.2%",
    actual: null,
    revised: null,
    eventType: "inflation",
    category: "Prices",
    source: "test",
    status: "scheduled",
    isFixture: false,
    historicalValues: [],
    relatedMarkets: ["Gold"],
    educationalExplanation: null,
    tradingConsiderations: [],
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("economic filtering and time", () => {
  it("filters by search, country, currency, impact and event type", () => {
    const events = [
      event(),
      event({
        id: "two",
        title: "ECB Decision",
        country: "EU",
        countryName: "Euro Area",
        currency: "EUR",
        eventType: "central-bank",
      }),
    ];
    expect(
      filterEconomicEvents(events, {
        search: "cpi",
        countries: ["US"],
        currencies: ["USD"],
        impacts: ["high"],
        eventTypes: ["inflation"],
      }).map((item) => item.id),
    ).toEqual(["one"]);
  });

  it("sorts chronologically", () => {
    const events = [
      event({ id: "later", scheduledTime: "2026-07-16T12:00:00Z" }),
      event({ id: "earlier", scheduledTime: "2026-07-15T12:00:00Z" }),
    ];
    expect(filterEconomicEvents(events, {}).map((item) => item.id)).toEqual([
      "earlier",
      "later",
    ]);
  });

  it("converts timezone display and computes New York day/week boundaries", () => {
    const now = new Date("2026-07-15T12:00:00Z");
    expect(getEconomicDayRange(now, "America/New_York")).toEqual({
      from: "2026-07-15T04:00:00.000Z",
      to: "2026-07-16T03:59:59.999Z",
    });
    expect(getEconomicWeekRange(now, "America/New_York").from).toBe(
      "2026-07-13T04:00:00.000Z",
    );
    expect(
      formatEconomicTime("2026-07-15T12:30:00Z", "America/New_York"),
    ).toContain("8:30 AM");
  });

  it("formats countdown and stable API output", () => {
    expect(
      economicCountdown(
        "2026-07-15T13:45:00Z",
        new Date("2026-07-15T12:00:00Z"),
      ),
    ).toBe("In 1h 45m");
    expect(
      formatEconomicResponse({
        events: [event()],
        total: 1,
        limit: 50,
        offset: 0,
        generatedAt: "2026-07-15T12:00:00Z",
        simulated: false,
      }),
    ).toMatchObject({
      data: [{ title: "US CPI" }],
      meta: { total: 1, simulated: false },
    });
  });
});
