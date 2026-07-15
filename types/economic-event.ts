import type { EconomicCountryCode } from "./economic-country";
import type { EconomicCurrency } from "./economic-currency";
import type { EconomicImpact } from "./economic-impact";

export const ECONOMIC_EVENT_STATUSES = [
  "scheduled",
  "released",
  "revised",
  "cancelled",
] as const;

export type EconomicEventStatus = (typeof ECONOMIC_EVENT_STATUSES)[number];

export type EconomicHistoricalValue = {
  date: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
};

export type EconomicEvent = {
  id: string;
  providerEventId: string;
  title: string;
  description: string | null;
  country: EconomicCountryCode;
  countryName: string;
  currency: EconomicCurrency;
  impact: EconomicImpact;
  scheduledTime: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  revised: string | null;
  eventType: string;
  category: string;
  source: string;
  status: EconomicEventStatus;
  isFixture: boolean;
  historicalValues: EconomicHistoricalValue[];
  relatedMarkets: string[];
  educationalExplanation: string | null;
  tradingConsiderations: string[];
  createdAt: string;
  updatedAt: string;
};
