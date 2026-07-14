export type WatchlistItem = {
  name: string;
  session: string;
  symbol: string;
};

export type Watchlist = {
  createdAt: string;
  id: string;
  items: WatchlistItem[];
  name: string;
  updatedAt: string;
  userId: string;
};
