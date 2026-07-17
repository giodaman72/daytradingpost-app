import Link from "next/link";
import type { InstrumentDefinition } from "@/constants/instruments";
import type { MarketQuote } from "@/types/market-data";
import type { MarketIntelligenceRecord } from "@/types/market-intelligence";
import {
  removeInstrumentAction,
  updateItemNotesAction,
  moveInstrumentAction,
} from "@/app/watchlists/actions";
export function WatchlistInstrumentRow({
  watchlistId,
  instrument,
  quote,
  intelligence,
  notes,
  canMoveUp,
  canMoveDown,
}: {
  watchlistId: string;
  instrument: InstrumentDefinition;
  quote: MarketQuote | null;
  intelligence: MarketIntelligenceRecord | null;
  notes: string | null;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <article className="watchlist-instrument">
      <header>
        <div>
          <span>{instrument.assetClass}</span>
          <h2>
            {instrument.name} <small>{instrument.symbol}</small>
          </h2>
        </div>
        <Link href={`/alerts/new?instrument=${instrument.slug}`}>
          Create alert
        </Link>
      </header>
      <div className="watchlist-instrument-data">
        <section>
          <span>Market data</span>
          <strong>{quote?.price ?? "Unavailable"}</strong>
          <p>
            {quote?.changePercent
              ? `${quote.changePercent}% today`
              : "No verified change available"}
          </p>
          <small>
            {quote?.simulated
              ? "Simulated — cannot trigger alerts"
              : quote?.delayed
                ? "Delayed quote"
                : (quote?.disclosure ?? "Provider unavailable")}
          </small>
        </section>
        <section>
          <span>Editorial intelligence</span>
          <strong>{intelligence?.bias ?? "No outlook"}</strong>
          <p>
            {intelligence?.shortSummary ??
              "No published intelligence for this instrument."}
          </p>
          {intelligence?.relatedArticleSlug ? (
            <Link href={`/analysis/${intelligence.relatedArticleSlug}`}>
              Related analysis →
            </Link>
          ) : null}
        </section>
      </div>
      <form action={updateItemNotesAction} className="smart-inline-form">
        <input type="hidden" name="id" value={watchlistId} />
        <input type="hidden" name="instrument" value={instrument.slug} />
        <label htmlFor={`notes-${instrument.slug}`}>Private notes</label>
        <input
          id={`notes-${instrument.slug}`}
          name="notes"
          defaultValue={notes ?? ""}
          maxLength={500}
        />
        <button type="submit">Save notes</button>
      </form>
      <form action={removeInstrumentAction}>
        <input type="hidden" name="id" value={watchlistId} />
        <input type="hidden" name="instrument" value={instrument.slug} />
        <button className="danger-link" type="submit">
          Remove instrument
        </button>
      </form>
      <form action={moveInstrumentAction} className="watchlist-order-actions">
        <input type="hidden" name="id" value={watchlistId} />
        <input type="hidden" name="instrument" value={instrument.slug} />
        <span>Keyboard ordering:</span>
        <button name="direction" value="up" disabled={!canMoveUp}>
          Move up
        </button>
        <button name="direction" value="down" disabled={!canMoveDown}>
          Move down
        </button>
      </form>
    </article>
  );
}
