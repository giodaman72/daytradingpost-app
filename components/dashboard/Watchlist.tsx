import Link from "next/link";
import { getInstrument } from "@/constants/instruments";
import type { MarketQuote } from "@/types/market-data";
import type { WatchlistWithItems } from "@/types/watchlist";
import { DashboardPanel } from "./DashboardPanel";
export function Watchlist({
  watchlist,
  quotes,
}: {
  watchlist: WatchlistWithItems | null;
  quotes: MarketQuote[];
}) {
  return (
    <DashboardPanel
      id="watchlist"
      eyebrow="Default watchlist"
      title={watchlist?.name ?? "Watchlist"}
    >
      {watchlist?.items.length ? (
        <ul className="dashboard-watchlist">
          {watchlist.items.slice(0, 5).map((item) => {
            const instrument = getInstrument(item.instrumentSlug);
            const quote = quotes.find(
              (candidate) => candidate.instrumentSlug === item.instrumentSlug,
            );
            return (
              <li key={item.id}>
                <div>
                  <strong>{instrument?.name ?? item.instrumentSlug}</strong>
                  <span>{instrument?.symbol}</span>
                </div>
                <span>{quote?.price ?? "Unavailable"}</span>
                <span className="watchlist-status">
                  <i aria-hidden="true" />
                  {quote?.delayed
                    ? "Delayed"
                    : quote?.simulated
                      ? "Simulated"
                      : (quote?.marketStatus ?? "Tracking")}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="dashboard-empty">
          <p>Your default watchlist is empty.</p>
        </div>
      )}
      <p className="dashboard-data-note">
        Verified provider snapshots only · Editorial outlooks remain separate
      </p>
      <Link
        href={watchlist ? `/watchlists/${watchlist.id}` : "/watchlists"}
        className="text-link"
      >
        Manage watchlists →
      </Link>
    </DashboardPanel>
  );
}
