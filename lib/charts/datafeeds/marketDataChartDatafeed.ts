import "server-only";
import { getQuoteByInstrument } from "@/lib/market-data/marketDataService";
import type { ChartDatafeed, ChartRange } from "./ChartDatafeed";

export class MarketDataChartDatafeed implements ChartDatafeed {
  readonly id = "market_data";
  async getBars(range: ChartRange) {
    const quote = await getQuoteByInstrument(range.instrument);
    return {
      data: [],
      meta: {
        instrument: range.instrument,
        timeframe: range.timeframe,
        delayed: quote?.delayed ?? true,
        fixture: quote?.simulated ?? false,
        source: quote?.provider ?? "unavailable",
        marketStatus: quote?.marketStatus ?? "unavailable",
        generatedAt: new Date().toISOString(),
      },
    };
  }
}
