import type { WatchlistWithItems } from "@/types/watchlist";
import { WatchlistCard } from "./WatchlistCard";
import { WatchlistEmptyState } from "./WatchlistEmptyState";
export function WatchlistGrid({
  watchlists,
}: {
  watchlists: WatchlistWithItems[];
}) {
  return watchlists.length ? (
    <div className="smart-grid">
      {watchlists.map((watchlist) => (
        <WatchlistCard key={watchlist.id} watchlist={watchlist} />
      ))}
    </div>
  ) : (
    <WatchlistEmptyState />
  );
}
