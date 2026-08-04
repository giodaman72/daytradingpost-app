import type { AssetClass } from "@/types/market-intelligence";
import type { ChartTimeframe } from "@/types/chart-timeframe";

export type InstrumentDefinition = {
  slug: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  displayOrder: number;
  enabled: boolean;
  quoteCurrency: string;
  decimalPrecision: number;
  providerSymbols: Record<string, string>;
  tradingViewSymbol: string;
  exchange: string;
  timezone: string;
  defaultTimeframe: ChartTimeframe;
  supportedTimeframes: ChartTimeframe[];
  chartAvailable: boolean;
  marketDataAvailable: boolean;
  delayedByDefault: boolean;
  marketHours:
    "metals" | "us-equities" | "energy" | "crypto-24-7" | "forex-24-5";
};

export const INSTRUMENTS = [
  [
    "gold",
    "XAUUSD",
    "Gold",
    "commodities",
    "USD",
    2,
    "metals",
    "OANDA:XAUUSD",
    "OANDA",
  ],
  [
    "silver",
    "XAGUSD",
    "Silver",
    "commodities",
    "USD",
    3,
    "metals",
    "OANDA:XAGUSD",
    "OANDA",
  ],
  [
    "nasdaq-100",
    "NAS100",
    "Nasdaq 100",
    "indices",
    "USD",
    2,
    "us-equities",
    "NASDAQ:NDX",
    "NASDAQ",
  ],
  [
    "sp-500",
    "SPX500",
    "S&P 500",
    "indices",
    "USD",
    2,
    "us-equities",
    "SP:SPX",
    "SP",
  ],
  [
    "dow-jones",
    "DJ30",
    "Dow Jones",
    "indices",
    "USD",
    0,
    "us-equities",
    "DJ:DJI",
    "DJ",
  ],
  [
    "wti-crude-oil",
    "WTI",
    "WTI Crude Oil",
    "commodities",
    "USD",
    2,
    "energy",
    "TVC:USOIL",
    "TVC",
  ],
  [
    "natural-gas",
    "NATGAS",
    "Natural Gas",
    "commodities",
    "USD",
    3,
    "energy",
    "NYMEX:NG1!",
    "NYMEX",
  ],
  [
    "copper",
    "COPPER",
    "Copper",
    "commodities",
    "USD",
    4,
    "metals",
    "CAPITALCOM:COPPER",
    "CAPITALCOM",
  ],
  [
    "bitcoin",
    "BTCUSD",
    "Bitcoin",
    "crypto",
    "USD",
    2,
    "crypto-24-7",
    "COINBASE:BTCUSD",
    "COINBASE",
  ],
  [
    "ethereum",
    "ETHUSD",
    "Ethereum",
    "crypto",
    "USD",
    2,
    "crypto-24-7",
    "COINBASE:ETHUSD",
    "COINBASE",
  ],
  [
    "eurusd",
    "EURUSD",
    "EUR/USD",
    "forex",
    "USD",
    5,
    "forex-24-5",
    "OANDA:EURUSD",
    "OANDA",
  ],
  [
    "gbpusd",
    "GBPUSD",
    "GBP/USD",
    "forex",
    "USD",
    5,
    "forex-24-5",
    "OANDA:GBPUSD",
    "OANDA",
  ],
  [
    "usdjpy",
    "USDJPY",
    "USD/JPY",
    "forex",
    "JPY",
    3,
    "forex-24-5",
    "OANDA:USDJPY",
    "OANDA",
  ],
].map(
  (
    [
      slug,
      symbol,
      name,
      assetClass,
      quoteCurrency,
      decimalPrecision,
      marketHours,
      tradingViewSymbol,
      exchange,
    ],
    index,
  ) => ({
    slug,
    symbol,
    name,
    assetClass,
    displayOrder: index + 1,
    enabled: true,
    quoteCurrency,
    decimalPrecision,
    providerSymbols: {
      development: symbol,
      generic_http: symbol,
      tradingview: tradingViewSymbol,
    },
    tradingViewSymbol,
    exchange,
    timezone: marketHours === "us-equities" ? "America/New_York" : "Etc/UTC",
    defaultTimeframe: assetClass === "crypto" ? "4h" : "1h",
    supportedTimeframes: [
      "1m",
      "5m",
      "15m",
      "30m",
      "1h",
      "4h",
      "1d",
      "1w",
      "1M",
    ],
    chartAvailable: true,
    marketDataAvailable: true,
    delayedByDefault: true,
    marketHours,
  }),
) as InstrumentDefinition[];

export function getProviderSymbol(
  instrument: InstrumentDefinition,
  provider: string,
) {
  return instrument.providerSymbols[provider] ?? null;
}

export function getInstrument(slugOrSymbol: string) {
  const value = slugOrSymbol.trim().toLowerCase().replaceAll("/", "");
  return (
    INSTRUMENTS.find(
      (item) => item.slug === value || item.symbol.toLowerCase() === value,
    ) ?? null
  );
}
