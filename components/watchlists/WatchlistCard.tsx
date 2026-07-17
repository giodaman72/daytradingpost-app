import Link from "next/link";
import type { WatchlistWithItems } from "@/types/watchlist";
export function WatchlistCard({
  watchlist,
}: {
  watchlist: WatchlistWithItems;
}) {
  return (
    <article className="smart-card">
      <div className="smart-card-top">
        <span>
          {watchlist.isDefault ? "Default watchlist" : "Private watchlist"}
        </span>
        <strong>{watchlist.items.length} instruments</strong>
      </div>
      <h2>
        <Link href={`/watchlists/${watchlist.id}`}>{watchlist.name}</Link>
      </h2>
      <p>
        {watchlist.description ?? "A focused list for the markets you follow."}
      </p>
      <Link className="text-link" href={`/watchlists/${watchlist.id}`}>
        Open watchlist →
      </Link>
    </article>
  );
}
