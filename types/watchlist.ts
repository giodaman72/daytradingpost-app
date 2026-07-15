export type WatchlistItem = {
  id: string;
  watchlistId: string;
  userId: string;
  instrumentSlug: string;
  displayOrder: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
export type StaticWatchlistItem = {
  name: string;
  session: string;
  symbol: string;
};
export type Watchlist = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};
export type WatchlistWithItems = Watchlist & { items: WatchlistItem[] };
export type CreateWatchlistInput = {
  name: string;
  description?: string | null;
};
export type UpdateWatchlistInput = Partial<CreateWatchlistInput>;
