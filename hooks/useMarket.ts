"use client";

import { useContext } from "react";
import { MarketContext } from "@/providers/MarketProvider";

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) throw new Error("useMarket must be used within MarketProvider.");
  return context;
}
