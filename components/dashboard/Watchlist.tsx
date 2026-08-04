import Link from "next/link";
import { getInstrument } from "@/constants/instruments";
import type { MarketQuote } from "@/types/market-data";
import type { WatchlistWithItems } from "@/types/watchlist";
import { DashboardPanel } from "./DashboardPanel";
import { localizeHref, type Locale } from "@/lib/i18n/config";
export function Watchlist({
  watchlist,
  quotes,
  locale = "en",
}: {
  watchlist: WatchlistWithItems | null;
  quotes: MarketQuote[];
  locale?: Locale;
}) {
  const spanish = locale === "es";
  return (
    <DashboardPanel
      id="watchlist"
      eyebrow={spanish ? "Lista predeterminada" : "Default watchlist"}
      title={
        watchlist?.name ?? (spanish ? "Lista de seguimiento" : "Watchlist")
      }
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
                <span>
                  {quote?.price ?? (spanish ? "No disponible" : "Unavailable")}
                </span>
                <span className="watchlist-status">
                  <i aria-hidden="true" />
                  {quote?.delayed
                    ? spanish
                      ? "Con retraso"
                      : "Delayed"
                    : quote?.simulated
                      ? spanish
                        ? "Simulado"
                        : "Simulated"
                      : (quote?.marketStatus ??
                        (spanish ? "En seguimiento" : "Tracking"))}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="dashboard-empty">
          <p>
            {spanish
              ? "Tu lista de seguimiento predeterminada está vacía."
              : "Your default watchlist is empty."}
          </p>
        </div>
      )}
      <p className="dashboard-data-note">
        {spanish
          ? "Solo datos verificados del proveedor · Las perspectivas editoriales permanecen separadas"
          : "Verified provider snapshots only · Editorial outlooks remain separate"}
      </p>
      <Link
        href={localizeHref(
          watchlist ? `/watchlists/${watchlist.id}` : "/watchlists",
          locale,
        )}
        className="text-link"
      >
        {spanish ? "Gestionar listas" : "Manage watchlists"} →
      </Link>
    </DashboardPanel>
  );
}
