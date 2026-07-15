import "server-only";

import type {
  EconomicFilters,
  EconomicCalendarResult,
} from "@/types/economic-calendar";
import type { EconomicEvent } from "@/types/economic-event";
import { EconomicCalendarCache } from "./economicCalendarCache";
import {
  filterEconomicEvents,
  getEconomicDayRange,
  getEconomicWeekRange,
  paginateEconomicEvents,
} from "./economicFilters";
import { getEconomicProvider } from "./providers";
import { getStoredEconomicEvent } from "./economicRepository";

const cache = new EconomicCalendarCache(
  Number(process.env.ECONOMIC_CACHE_SECONDS || 300) * 1000,
);

async function rangeEvents(from: string, to: string) {
  const provider = getEconomicProvider();
  const key = `${provider.id}:${from}:${to}`;
  const cached = cache.get(key);
  if (cached) return { events: cached, simulated: provider.simulated };
  const events = await provider.getEvents({ from, to });
  cache.set(key, events);
  return { events, simulated: provider.simulated };
}

export async function getEconomicEvents(
  filters: EconomicFilters = {},
): Promise<EconomicCalendarResult> {
  const now = new Date();
  const from =
    filters.from ?? new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const to =
    filters.to ?? new Date(now.getTime() + 30 * 86_400_000).toISOString();
  const { events, simulated } = await rangeEvents(from, to);
  const filtered = filterEconomicEvents(events, { ...filters, from, to });
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;
  return {
    events: paginateEconomicEvents(filtered, limit, offset),
    total: filtered.length,
    limit,
    offset,
    generatedAt: new Date().toISOString(),
    simulated,
  };
}

export async function getEconomicToday(
  now = new Date(),
  timeZone = "America/New_York",
) {
  const range = getEconomicDayRange(now, timeZone);
  return getEconomicEvents({ ...range, limit: 100 });
}
export async function getEconomicTomorrow(
  now = new Date(),
  timeZone = "America/New_York",
) {
  const range = getEconomicDayRange(now, timeZone, 1);
  return getEconomicEvents({ ...range, limit: 100 });
}
export async function getEconomicWeek(
  now = new Date(),
  timeZone = "America/New_York",
) {
  const range = getEconomicWeekRange(now, timeZone);
  return getEconomicEvents({ ...range, limit: 100 });
}
export async function getUpcomingEconomicEvents(limit = 10, now = new Date()) {
  return getEconomicEvents({
    from: now.toISOString(),
    to: new Date(now.getTime() + 30 * 86_400_000).toISOString(),
    limit,
  });
}
export async function getRecentEconomicReleases(limit = 10, now = new Date()) {
  return getEconomicEvents({
    from: new Date(now.getTime() - 14 * 86_400_000).toISOString(),
    to: now.toISOString(),
    statuses: ["released", "revised"],
    limit,
  });
}

export async function getEconomicEventById(id: string) {
  if (
    id.startsWith("fixture-") &&
    process.env.NODE_ENV !== "production" &&
    process.env.ECONOMIC_DATA_PROVIDER === "development"
  ) {
    const dateMatch = id.match(/(\d{4}-\d{2}-\d{2})$/);
    if (dateMatch) {
      const date = new Date(`${dateMatch[1]}T12:00:00Z`);
      const result = await getEconomicWeek(date, "UTC");
      return result.events.find((event) => event.id === id) ?? null;
    }
  }
  return getStoredEconomicEvent(id);
}

export type { EconomicEvent };
export {
  economicCountdown,
  formatEconomicResponse,
  formatEconomicTime,
  getEconomicDayRange,
  getEconomicWeekRange,
} from "./economicFilters";
