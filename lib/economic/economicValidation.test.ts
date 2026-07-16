import { describe, expect, it } from "vitest";
import {
  normalizeEconomicEvent,
  parseEconomicFilters,
} from "./economicValidation";

describe("economic validation and normalization", () => {
  it("normalizes provider fields without exposing raw structures", () => {
    expect(
      normalizeEconomicEvent(
        {
          id: "provider-1",
          title: " CPI ",
          country: "US",
          countryName: "United States",
          currency: "USD",
          impact: "high",
          scheduledTime: "2026-07-15T12:30:00Z",
          status: "scheduled",
        },
        "provider",
      ),
    ).toMatchObject({
      id: "provider-1",
      title: "CPI",
      source: "provider",
      isFixture: false,
      scheduledTime: "2026-07-15T12:30:00.000Z",
    });
  });

  it("rejects malformed provider events", () => {
    expect(
      normalizeEconomicEvent(
        {
          id: "bad",
          title: "",
          country: "XX",
          currency: "USD",
          impact: "high",
          scheduledTime: "bad",
        },
        "provider",
      ),
    ).toBeNull();
  });

  it("validates API filters and pagination", () => {
    const valid = parseEconomicFilters(
      new URLSearchParams("country=US&currency=USD&impact=high&limit=20"),
    );
    expect(valid).toMatchObject({
      valid: true,
      filters: {
        countries: ["US"],
        currencies: ["USD"],
        impacts: ["high"],
        limit: 20,
      },
    });
    expect(
      parseEconomicFilters(new URLSearchParams("from=nope&limit=1000")).valid,
    ).toBe(false);
    expect(
      parseEconomicFilters(
        new URLSearchParams("country=XX&currency=ABC&impact=extreme"),
      ).errors,
    ).toHaveLength(3);
  });
});
