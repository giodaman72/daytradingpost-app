import { getProviderSymbol } from "@/constants/instruments";
import { normalizeProviderQuote, unavailableQuote } from "../marketDataMapper";
import type { MarketDataProvider } from "./MarketDataProvider";
import type {
  MarketDataHealth,
  ProviderQuotePayload,
} from "@/types/market-data";

const FIXTURES: Record<
  string,
  Omit<ProviderQuotePayload, "providerTimestamp">
> = {
  XAUUSD: {
    price: "2400.00",
    previousClose: "2392.50",
    change: "7.50",
    changePercent: "0.3135",
    dayHigh: "2412.00",
    dayLow: "2386.00",
  },
  XAGUSD: {
    price: "30.125",
    previousClose: "29.950",
    change: "0.175",
    changePercent: "0.5843",
    dayHigh: "30.300",
    dayLow: "29.800",
  },
  NAS100: {
    price: "20000.00",
    previousClose: "19940.00",
    change: "60.00",
    changePercent: "0.3009",
    dayHigh: "20120.00",
    dayLow: "19880.00",
  },
  SPX500: {
    price: "5500.00",
    previousClose: "5485.00",
    change: "15.00",
    changePercent: "0.2735",
    dayHigh: "5520.00",
    dayLow: "5470.00",
  },
  DJ30: {
    price: "40000",
    previousClose: "39920",
    change: "80",
    changePercent: "0.2004",
    dayHigh: "40120",
    dayLow: "39800",
  },
  WTI: {
    price: "78.50",
    previousClose: "77.90",
    change: "0.60",
    changePercent: "0.7702",
    dayHigh: "79.20",
    dayLow: "77.40",
  },
  NATGAS: {
    price: "2.650",
    previousClose: "2.700",
    change: "-0.050",
    changePercent: "-1.8519",
    dayHigh: "2.720",
    dayLow: "2.610",
  },
  COPPER: {
    price: "4.5250",
    previousClose: "4.5000",
    change: "0.0250",
    changePercent: "0.5556",
    dayHigh: "4.5600",
    dayLow: "4.4700",
  },
  BTCUSD: {
    price: "100000.00",
    previousClose: "99500.00",
    change: "500.00",
    changePercent: "0.5025",
    dayHigh: "101500.00",
    dayLow: "98200.00",
  },
  ETHUSD: {
    price: "3500.00",
    previousClose: "3460.00",
    change: "40.00",
    changePercent: "1.1561",
    dayHigh: "3560.00",
    dayLow: "3400.00",
  },
  EURUSD: {
    price: "1.08500",
    previousClose: "1.08300",
    change: "0.00200",
    changePercent: "0.1847",
    dayHigh: "1.08700",
    dayLow: "1.08100",
  },
  GBPUSD: {
    price: "1.27500",
    previousClose: "1.27200",
    change: "0.00300",
    changePercent: "0.2358",
    dayHigh: "1.27800",
    dayLow: "1.26900",
  },
  USDJPY: {
    price: "158.250",
    previousClose: "158.600",
    change: "-0.350",
    changePercent: "-0.2207",
    dayHigh: "158.900",
    dayLow: "157.900",
  },
};

export const developmentMarketDataProvider: MarketDataProvider = {
  id: "development",
  simulated: true,
  async getQuote(instrument) {
    const receivedAt = new Date().toISOString();
    const symbol = getProviderSymbol(instrument, "development");
    const fixture = symbol ? FIXTURES[symbol] : null;
    if (!fixture)
      return unavailableQuote(
        instrument,
        "development",
        "No simulated fixture is configured for this instrument.",
      );
    return (
      normalizeProviderQuote({
        instrument,
        payload: {
          ...fixture,
          symbol,
          currency: instrument.quoteCurrency,
          marketStatus: "unknown",
          providerTimestamp: receivedAt,
          delayed: false,
        },
        provider: "development",
        simulated: true,
        receivedAt,
      }) ?? unavailableQuote(instrument, "development")
    );
  },
  async getQuotes(instruments) {
    return Promise.all(
      instruments.map((instrument) => this.getQuote(instrument)),
    );
  },
  async getDailySnapshot(instrument) {
    return this.getQuote(instrument);
  },
  async healthCheck(): Promise<MarketDataHealth> {
    return {
      configured: true,
      healthy: true,
      provider: "development",
      checkedAt: new Date().toISOString(),
      message:
        "Simulated development fixtures are enabled. They are not production market data.",
    };
  },
};

export function getDevelopmentFixture(symbol: string) {
  return FIXTURES[symbol] ?? null;
}
