import "server-only";

import type { EconomicProvider } from "./EconomicProvider";
import { developmentEconomicProvider } from "./developmentProvider";
import { getStoredEconomicEvents } from "../economicRepository";
import { getEconomicDayRange, getEconomicWeekRange } from "../economicFilters";

const databaseProvider: EconomicProvider = {
  id: "supabase",
  simulated: false,
  getEvents: ({ from, to }) => getStoredEconomicEvents(from, to),
  async getToday(now = new Date(), timeZone = "America/New_York") {
    const range = getEconomicDayRange(now, timeZone);
    return getStoredEconomicEvents(range.from, range.to);
  },
  async getWeek(now = new Date(), timeZone = "America/New_York") {
    const range = getEconomicWeekRange(now, timeZone);
    return getStoredEconomicEvents(range.from, range.to);
  },
  async getUpcoming(limit = 10, now = new Date()) {
    return (
      await getStoredEconomicEvents(
        now.toISOString(),
        new Date(now.getTime() + 30 * 86_400_000).toISOString(),
      )
    ).slice(0, limit);
  },
  async getHistorical(limit = 10, now = new Date()) {
    return (
      await getStoredEconomicEvents(
        new Date(now.getTime() - 90 * 86_400_000).toISOString(),
        now.toISOString(),
      )
    )
      .reverse()
      .slice(0, limit);
  },
  async getCountries() {
    const rows = await this.getWeek();
    return [
      ...new Map(
        rows.map((item) => [
          item.country,
          { code: item.country, name: item.countryName },
        ]),
      ).values(),
    ];
  },
  async getCurrencies() {
    return [...new Set((await this.getWeek()).map((item) => item.currency))];
  },
};

export function getEconomicProvider(): EconomicProvider {
  const configured = process.env.ECONOMIC_DATA_PROVIDER?.trim().toLowerCase();
  if (configured === "development" && process.env.NODE_ENV !== "production")
    return developmentEconomicProvider;
  return databaseProvider;
}

export type { EconomicProvider } from "./EconomicProvider";
