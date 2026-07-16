import type { EconomicCountry } from "@/types/economic-country";
import type { EconomicCurrency } from "@/types/economic-currency";
import type { EconomicEvent } from "@/types/economic-event";

export type EconomicDateRange = { from: string; to: string };

export interface EconomicProvider {
  readonly id: string;
  readonly simulated: boolean;
  getEvents(range: EconomicDateRange): Promise<EconomicEvent[]>;
  getToday(now?: Date, timeZone?: string): Promise<EconomicEvent[]>;
  getWeek(now?: Date, timeZone?: string): Promise<EconomicEvent[]>;
  getUpcoming(limit?: number, now?: Date): Promise<EconomicEvent[]>;
  getHistorical(limit?: number, now?: Date): Promise<EconomicEvent[]>;
  getCountries(): Promise<EconomicCountry[]>;
  getCurrencies(): Promise<EconomicCurrency[]>;
}
