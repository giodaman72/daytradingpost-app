import { MarketChange } from "./MarketChange";
import { MarketDataDisclosure } from "./MarketDataDisclosure";
import { MarketDataTimestamp } from "./MarketDataTimestamp";
import { MarketDataUnavailable } from "./MarketDataUnavailable";
import { MarketPrice } from "./MarketPrice";
import { MarketStatusBadge } from "./MarketStatusBadge";
import { getInstrument } from "@/constants/instruments";
import type { MarketQuote } from "@/types/market-data";

export function MarketDataCard({
  quote,
  compact = false,
}: {
  quote: MarketQuote;
  compact?: boolean;
}) {
  const instrument = getInstrument(quote.instrumentSlug);
  return (
    <article className={`md-card${compact ? " md-card-compact" : ""}`}>
      <header>
        <div>
          <span>{quote.symbol}</span>
          <h3>{instrument?.name ?? quote.instrumentSlug}</h3>
        </div>
        <MarketStatusBadge status={quote.marketStatus} />
      </header>
      {quote.price === null ? (
        <MarketDataUnavailable instrument={instrument?.name} />
      ) : (
        <>
          <MarketPrice
            value={quote.price}
            currency={quote.currency}
            instrumentSlug={quote.instrumentSlug}
          />
          <MarketChange
            change={quote.change}
            changePercent={quote.changePercent}
          />
          {!compact ? (
            <dl>
              <div>
                <dt>Day high</dt>
                <dd>{quote.dayHigh ?? "Unavailable"}</dd>
              </div>
              <div>
                <dt>Day low</dt>
                <dd>{quote.dayLow ?? "Unavailable"}</dd>
              </div>
            </dl>
          ) : null}
          <MarketDataTimestamp
            value={quote.providerTimestamp}
            receivedAt={quote.receivedAt}
          />
        </>
      )}
      <MarketDataDisclosure quote={quote} />
      <small className="md-provider">Source: {quote.provider}</small>
    </article>
  );
}
