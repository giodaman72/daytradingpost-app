import type { InstrumentDefinition } from "@/constants/instruments";
import type { MarketDataHealth, MarketQuote } from "@/types/market-data";

export interface MarketDataProvider {
  readonly id: string;
  readonly simulated: boolean;
  getQuote(instrument: InstrumentDefinition): Promise<MarketQuote>;
  getQuotes(instruments: InstrumentDefinition[]): Promise<MarketQuote[]>;
  getDailySnapshot(instrument: InstrumentDefinition): Promise<MarketQuote>;
  healthCheck(): Promise<MarketDataHealth>;
}
