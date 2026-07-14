import { MARKETS } from "@/constants/markets";

export function getMarkets() {
  return MARKETS;
}

export function getMarketBySlug(slug: string) {
  return MARKETS.find((market) => market.slug === slug) ?? null;
}

export function getMarketBySymbol(symbol: string) {
  const normalizedSymbol = symbol.trim().toUpperCase();
  return (
    MARKETS.find(
      (market) => market.symbol.toUpperCase() === normalizedSymbol,
    ) ?? null
  );
}
