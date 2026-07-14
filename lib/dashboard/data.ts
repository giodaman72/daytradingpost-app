import type { EconomicEvent } from "@/types/market";

export const economicEvents: EconomicEvent[] = [
  {
    id: "us-cpi",
    time: "08:30 ET",
    currency: "USD",
    impact: "High",
    event: "Consumer Price Index",
  },
  {
    id: "eu-production",
    time: "05:00 ET",
    currency: "EUR",
    impact: "Medium",
    event: "Industrial Production",
  },
  {
    id: "us-inventories",
    time: "10:30 ET",
    currency: "USD",
    impact: "Medium",
    event: "Crude Oil Inventories",
  },
];
