"use client";

import { createContext, type ReactNode, useState } from "react";
import { MARKETS, type MarketSlug } from "@/constants/markets";

export type MarketContextValue = {
  selectedMarket: (typeof MARKETS)[number];
  setSelectedMarket: (slug: MarketSlug) => void;
};

export const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({
  children,
  initialMarket = "gold",
}: {
  children: ReactNode;
  initialMarket?: MarketSlug;
}) {
  const [selectedSlug, setSelectedMarket] = useState<MarketSlug>(initialMarket);
  const selectedMarket =
    MARKETS.find((market) => market.slug === selectedSlug) ?? MARKETS[0];

  return (
    <MarketContext.Provider value={{ selectedMarket, setSelectedMarket }}>
      {children}
    </MarketContext.Provider>
  );
}
