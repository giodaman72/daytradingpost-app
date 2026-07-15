import type { AssetClass } from "@/types/market-intelligence";

export type InstrumentDefinition = {
  slug: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  displayOrder: number;
  enabled: boolean;
};

export const INSTRUMENTS = [
  ["gold", "XAUUSD", "Gold", "commodities"],
  ["silver", "XAGUSD", "Silver", "commodities"],
  ["nasdaq-100", "NAS100", "Nasdaq 100", "indices"],
  ["sp-500", "SPX500", "S&P 500", "indices"],
  ["dow-jones", "DJ30", "Dow Jones", "indices"],
  ["wti-crude-oil", "WTI", "WTI Crude Oil", "commodities"],
  ["natural-gas", "NATGAS", "Natural Gas", "commodities"],
  ["copper", "COPPER", "Copper", "commodities"],
  ["bitcoin", "BTCUSD", "Bitcoin", "crypto"],
  ["ethereum", "ETHUSD", "Ethereum", "crypto"],
  ["eurusd", "EURUSD", "EURUSD", "forex"],
  ["gbpusd", "GBPUSD", "GBPUSD", "forex"],
  ["usdjpy", "USDJPY", "USDJPY", "forex"],
].map(([slug, symbol, name, assetClass], index) => ({
  slug,
  symbol,
  name,
  assetClass,
  displayOrder: index + 1,
  enabled: true,
})) as InstrumentDefinition[];

export function getInstrument(slugOrSymbol: string) {
  const value = slugOrSymbol.trim().toLowerCase().replaceAll("/", "");
  return (
    INSTRUMENTS.find(
      (item) => item.slug === value || item.symbol.toLowerCase() === value,
    ) ?? null
  );
}
