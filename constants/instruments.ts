import type { AssetClass } from "@/types/market-intelligence";

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
  marketHours:
    "metals" | "us-equities" | "energy" | "crypto-24-7" | "forex-24-5";
};

export const INSTRUMENTS = [
  ["gold", "XAUUSD", "Gold", "commodities", "USD", 2, "metals"],
  ["silver", "XAGUSD", "Silver", "commodities", "USD", 3, "metals"],
  ["nasdaq-100", "NAS100", "Nasdaq 100", "indices", "USD", 2, "us-equities"],
  ["sp-500", "SPX500", "S&P 500", "indices", "USD", 2, "us-equities"],
  ["dow-jones", "DJ30", "Dow Jones", "indices", "USD", 0, "us-equities"],
  ["wti-crude-oil", "WTI", "WTI Crude Oil", "commodities", "USD", 2, "energy"],
  ["natural-gas", "NATGAS", "Natural Gas", "commodities", "USD", 3, "energy"],
  ["copper", "COPPER", "Copper", "commodities", "USD", 4, "metals"],
  ["bitcoin", "BTCUSD", "Bitcoin", "crypto", "USD", 2, "crypto-24-7"],
  ["ethereum", "ETHUSD", "Ethereum", "crypto", "USD", 2, "crypto-24-7"],
  ["eurusd", "EURUSD", "EUR/USD", "forex", "USD", 5, "forex-24-5"],
  ["gbpusd", "GBPUSD", "GBP/USD", "forex", "USD", 5, "forex-24-5"],
  ["usdjpy", "USDJPY", "USD/JPY", "forex", "JPY", 3, "forex-24-5"],
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
    },
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
