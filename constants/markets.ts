import type { MarketDefinition } from "@/types/market";
import type { WatchlistItem } from "@/types/watchlist";

export const MARKETS = [
  {
    category: "commodity",
    name: "Gold",
    session: "Global",
    slug: "gold",
    symbol: "XAU/USD",
  },
  {
    category: "index",
    name: "Nasdaq 100",
    session: "US",
    slug: "nasdaq",
    symbol: "NAS100",
  },
  {
    category: "commodity",
    name: "Crude Oil",
    session: "US",
    slug: "crude-oil",
    symbol: "WTI",
  },
  {
    category: "crypto",
    name: "Bitcoin",
    session: "24 hours",
    slug: "bitcoin",
    symbol: "BTC/USD",
  },
] as const satisfies readonly MarketDefinition[];

export const DEFAULT_WATCHLIST: readonly WatchlistItem[] = MARKETS.map(
  ({ name, session, symbol }) => ({ name, session, symbol }),
);

export type MarketSlug = (typeof MARKETS)[number]["slug"];
