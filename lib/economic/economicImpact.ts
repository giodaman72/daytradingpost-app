import type { EconomicEvent } from "@/types/economic-event";

const MARKET_CURRENCIES: Record<string, string[]> = {
  gold: ["USD"],
  indices: ["USD"],
  forex: ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "NZD", "CNY"],
  crypto: ["USD"],
};

export function getEventsForMarket(events: EconomicEvent[], market: string) {
  const currencies = MARKET_CURRENCIES[market] ?? [];
  return events.filter((event) => currencies.includes(event.currency));
}

export function describeEventRisk(event: EconomicEvent) {
  if (event.impact === "high")
    return `${event.currency} high-impact event risk`;
  if (event.impact === "medium") return `${event.currency} medium-impact event`;
  return `${event.currency} scheduled release`;
}
