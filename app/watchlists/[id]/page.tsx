import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AddInstrumentDialog } from "@/components/watchlists/AddInstrumentDialog";
import { WatchlistInstrumentRow } from "@/components/watchlists/WatchlistInstrumentRow";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import { INSTRUMENTS } from "@/constants/instruments";
import { getMembershipAccess } from "@/lib/membership/access";
import { getWatchlistById } from "@/lib/watchlists";
import { getMarketQuotes } from "@/lib/market-data/marketDataService";
import { getMarketIntelligenceByInstrument } from "@/lib/market/marketIntelligenceService";
import { getUpcomingEconomicEvents } from "@/lib/economic/economicService";
import {
  deleteWatchlistAction,
  setDefaultWatchlistAction,
  updateWatchlistAction,
} from "../actions";
export default async function WatchlistPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const access = await getMembershipAccess();
  const { id } = await params;
  if (!access.user) redirect(`/login?next=/watchlists/${id}`);
  const [watchlist, query] = await Promise.all([
    getWatchlistById(id),
    searchParams,
  ]);
  if (!watchlist) notFound();
  const instruments = watchlist.items
    .map((item) =>
      INSTRUMENTS.find((candidate) => candidate.slug === item.instrumentSlug),
    )
    .filter((item): item is (typeof INSTRUMENTS)[number] => Boolean(item));
  const [quotes, intelligence, economics] = await Promise.all([
    getMarketQuotes(instruments),
    Promise.all(
      instruments.map((item) => getMarketIntelligenceByInstrument(item.slug)),
    ),
    getUpcomingEconomicEvents(20),
  ]);
  return (
    <main className="smart-page">
      <Header />
      <section className="smart-hero compact">
        <div className="container">
          <span className="section-kicker">
            {watchlist.isDefault ? "Default watchlist" : "Private watchlist"}
          </span>
          <h1>{watchlist.name}</h1>
          <p>
            {watchlist.description ?? "Your personalized instrument monitor."}
          </p>
        </div>
      </section>
      <section className="smart-content">
        <div className="container">
          {query.notice ? (
            <p className="smart-message success" role="status">
              {query.notice}
            </p>
          ) : null}
          {query.error ? (
            <p className="smart-message error" role="alert">
              {query.error}
            </p>
          ) : null}
          <div className="smart-toolbar">
            <AddInstrumentDialog
              watchlistId={id}
              existing={watchlist.items.map((item) => item.instrumentSlug)}
            />
            {!watchlist.isDefault ? (
              <form action={setDefaultWatchlistAction}>
                <input type="hidden" name="id" value={id} />
                <button type="submit">Set as default</button>
              </form>
            ) : null}
          </div>
          <div className="watchlist-instruments">
            {instruments.length ? (
              instruments.map((instrument, index) => (
                <div key={instrument.slug}>
                  <WatchlistInstrumentRow
                    watchlistId={id}
                    instrument={instrument}
                    quote={quotes[index] ?? null}
                    intelligence={intelligence[index]}
                    notes={
                      watchlist.items.find(
                        (item) => item.instrumentSlug === instrument.slug,
                      )?.notes ?? null
                    }
                    canMoveUp={index > 0}
                    canMoveDown={index < instruments.length - 1}
                  />
                  {economics.events
                    .filter((event) =>
                      event.relatedMarkets.some(
                        (market) =>
                          market
                            .toLowerCase()
                            .includes(instrument.name.toLowerCase()) ||
                          market
                            .toLowerCase()
                            .includes(instrument.symbol.toLowerCase()),
                      ),
                    )
                    .slice(0, 2)
                    .map((event) => (
                      <p className="watchlist-economic" key={event.id}>
                        Upcoming:{" "}
                        <a href={`/economic-calendar/${event.id}`}>
                          {event.title}
                        </a>{" "}
                        ·{" "}
                        <time dateTime={event.scheduledTime}>
                          {new Date(event.scheduledTime).toLocaleString(
                            "en-US",
                            { timeZone: "America/New_York" },
                          )}
                        </time>
                      </p>
                    ))}
                </div>
              ))
            ) : (
              <div className="smart-empty">
                <h2>No instruments yet</h2>
                <p>Add a supported instrument above.</p>
              </div>
            )}
          </div>
          <div className="smart-admin">
            <form action={updateWatchlistAction} className="smart-inline-form">
              <input type="hidden" name="id" value={id} />
              <label htmlFor="rename-watchlist">Rename</label>
              <input
                id="rename-watchlist"
                name="name"
                defaultValue={watchlist.name}
                required
                maxLength={60}
              />
              <input
                name="description"
                defaultValue={watchlist.description ?? ""}
                aria-label="Description"
              />
              <button type="submit">Save</button>
            </form>
            <form action={deleteWatchlistAction}>
              <input type="hidden" name="id" value={id} />
              <ConfirmSubmitButton
                className="danger-link"
                message="Delete this watchlist and all of its items?"
              >
                Delete watchlist
              </ConfirmSubmitButton>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
