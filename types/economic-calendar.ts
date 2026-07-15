export type EconomicImpact = "low" | "medium" | "high";
export type EconomicCalendarEvent = {
  id: string;
  title: string;
  country: string;
  currency: string;
  impact: EconomicImpact;
  scheduledAt: string;
  previous: string | null;
  forecast: string | null;
  actual: string | null;
  source: string;
  isFixture: boolean;
};

export interface EconomicCalendarProvider {
  getEvents(from: string, to: string): Promise<EconomicCalendarEvent[]>;
}
