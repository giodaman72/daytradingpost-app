import type { EconomicEvent } from "@/types/economic-event";
import type { EconomicStatistics } from "@/types/economic-statistics";
import { getEconomicDayRange, getEconomicWeekRange } from "./economicFilters";

export function calculateEconomicStatistics(
  events: EconomicEvent[],
  now = new Date(),
  timeZone = "America/New_York",
): EconomicStatistics {
  const today = getEconomicDayRange(now, timeZone, 0);
  const tomorrow = getEconomicDayRange(now, timeZone, 1);
  const week = getEconomicWeekRange(now, timeZone);
  const inRange = (
    event: EconomicEvent,
    range: { from: string; to: string },
  ) => {
    const time = Date.parse(event.scheduledTime);
    return time >= Date.parse(range.from) && time <= Date.parse(range.to);
  };
  return {
    todayHighImpact: events.filter(
      (event) => event.impact === "high" && inRange(event, today),
    ).length,
    todayMediumImpact: events.filter(
      (event) => event.impact === "medium" && inRange(event, today),
    ).length,
    tomorrow: events.filter((event) => inRange(event, tomorrow)).length,
    thisWeek: events.filter((event) => inRange(event, week)).length,
    countriesCovered: new Set(events.map((event) => event.country)).size,
    currenciesCovered: new Set(events.map((event) => event.currency)).size,
  };
}
