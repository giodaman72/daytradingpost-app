import type { EconomicCountryCode } from "./economic-country";
import type { EconomicCurrency } from "./economic-currency";
import type { EconomicEvent, EconomicEventStatus } from "./economic-event";
import type { EconomicImpact } from "./economic-impact";

export type EconomicFilters = {
  from?: string;
  to?: string;
  search?: string;
  countries?: EconomicCountryCode[];
  currencies?: EconomicCurrency[];
  impacts?: EconomicImpact[];
  eventTypes?: string[];
  statuses?: EconomicEventStatus[];
  limit?: number;
  offset?: number;
};

export type EconomicCalendarResult = {
  events: EconomicEvent[];
  total: number;
  limit: number;
  offset: number;
  generatedAt: string;
  simulated: boolean;
};

export type EconomicCalendarResponse = {
  data: EconomicEvent[];
  meta: Omit<EconomicCalendarResult, "events">;
};

export type EconomicAlertLeadTime = "15_minutes" | "1_hour" | "24_hours";

export type EconomicAlertPreference = {
  eventId: string;
  leadTime: EconomicAlertLeadTime;
  enabled: boolean;
};
