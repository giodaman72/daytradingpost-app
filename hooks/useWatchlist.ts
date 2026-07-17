"use client";

import { useState } from "react";
import { DEFAULT_WATCHLIST } from "@/constants/markets";
import type { StaticWatchlistItem } from "@/types/watchlist";

export function useWatchlist(
  initialItems: readonly StaticWatchlistItem[] = DEFAULT_WATCHLIST,
) {
  const [items, setItems] = useState<StaticWatchlistItem[]>([...initialItems]);

  function addItem(item: StaticWatchlistItem) {
    setItems((current) =>
      current.some(({ symbol }) => symbol === item.symbol)
        ? current
        : [...current, item],
    );
  }

  function removeItem(symbol: string) {
    setItems((current) => current.filter((item) => item.symbol !== symbol));
  }

  return { addItem, items, removeItem };
}
