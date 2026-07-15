import type { EconomicFilters } from "@/types/economic-calendar";
import type { EconomicEvent } from "@/types/economic-event";
import type { EconomicCalendarResult } from "@/types/economic-calendar";

export function filterEconomicEvents(
  events: EconomicEvent[],
  filters: EconomicFilters,
) {
  const search = filters.search?.toLowerCase();
  return events
    .filter(
      (event) =>
        !filters.from ||
        Date.parse(event.scheduledTime) >= Date.parse(filters.from),
    )
    .filter(
      (event) =>
        !filters.to ||
        Date.parse(event.scheduledTime) <= Date.parse(filters.to),
    )
    .filter(
      (event) =>
        !search ||
        `${event.title} ${event.category} ${event.countryName} ${event.currency}`
          .toLowerCase()
          .includes(search),
    )
    .filter(
      (event) =>
        !filters.countries?.length || filters.countries.includes(event.country),
    )
    .filter(
      (event) =>
        !filters.currencies?.length ||
        filters.currencies.includes(event.currency),
    )
    .filter(
      (event) =>
        !filters.impacts?.length || filters.impacts.includes(event.impact),
    )
    .filter(
      (event) =>
        !filters.eventTypes?.length ||
        filters.eventTypes.includes(event.eventType),
    )
    .filter(
      (event) =>
        !filters.statuses?.length || filters.statuses.includes(event.status),
    )
    .sort((a, b) => Date.parse(a.scheduledTime) - Date.parse(b.scheduledTime));
}

export function paginateEconomicEvents(
  events: EconomicEvent[],
  limit = 50,
  offset = 0,
) {
  return events.slice(offset, offset + limit);
}

function timeZoneOffset(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  return (
    Date.UTC(
      value.year,
      value.month - 1,
      value.day,
      value.hour,
      value.minute,
      value.second,
    ) - date.getTime()
  );
}

function dateKey(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${value.year}-${value.month}-${value.day}`;
}

function zonedStart(key: string, timeZone: string) {
  const [year, month, day] = key.split("-").map(Number);
  const guess = new Date(Date.UTC(year, month - 1, day));
  const first = new Date(guess.getTime() - timeZoneOffset(guess, timeZone));
  return new Date(guess.getTime() - timeZoneOffset(first, timeZone));
}

function shiftDateKey(key: string, days: number) {
  const [year, month, day] = key.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + days));
  return value.toISOString().slice(0, 10);
}

export function getEconomicDayRange(
  now = new Date(),
  timeZone = "America/New_York",
  offsetDays = 0,
) {
  const key = shiftDateKey(dateKey(now, timeZone), offsetDays);
  const nextKey = shiftDateKey(key, 1);
  const start = zonedStart(key, timeZone);
  const next = zonedStart(nextKey, timeZone);
  return {
    from: start.toISOString(),
    to: new Date(next.getTime() - 1).toISOString(),
  };
}

export function getEconomicWeekRange(
  now = new Date(),
  timeZone = "America/New_York",
) {
  const key = dateKey(now, timeZone);
  const localNoon = new Date(`${key}T12:00:00Z`);
  const daysFromMonday = (localNoon.getUTCDay() + 6) % 7;
  const mondayKey = shiftDateKey(key, -daysFromMonday);
  const nextMondayKey = shiftDateKey(mondayKey, 7);
  const start = zonedStart(mondayKey, timeZone);
  const next = zonedStart(nextMondayKey, timeZone);
  return {
    from: start.toISOString(),
    to: new Date(next.getTime() - 1).toISOString(),
  };
}

export function formatEconomicTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
}

export function economicCountdown(value: string, now = new Date()) {
  const difference = Date.parse(value) - now.getTime();
  if (difference <= 0) return "Released";
  const minutes = Math.ceil(difference / 60_000);
  if (minutes < 60) return `In ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `In ${hours}h ${minutes % 60}m`;
  return `In ${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export function formatEconomicResponse(result: EconomicCalendarResult) {
  const { events, ...meta } = result;
  return { data: events, meta };
}
