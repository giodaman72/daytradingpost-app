import type { EconomicEvent, WatchlistItem } from "./types";

export const economicEvents: EconomicEvent[] = [
  { id: "us-cpi", time: "08:30 ET", currency: "USD", impact: "High", event: "Consumer Price Index" },
  { id: "eu-production", time: "05:00 ET", currency: "EUR", impact: "Medium", event: "Industrial Production" },
  { id: "us-inventories", time: "10:30 ET", currency: "USD", impact: "Medium", event: "Crude Oil Inventories" },
];

export const defaultWatchlist: WatchlistItem[] = [
  { symbol: "XAU/USD", name: "Gold", session: "Global" },
  { symbol: "NAS100", name: "Nasdaq 100", session: "US" },
  { symbol: "WTI", name: "Crude Oil", session: "US" },
  { symbol: "BTC/USD", name: "Bitcoin", session: "24 hours" },
];
