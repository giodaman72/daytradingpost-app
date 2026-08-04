import { MarketChange } from "./MarketChange";
import { MarketDataDisclosure } from "./MarketDataDisclosure";
import { MarketDataTimestamp } from "./MarketDataTimestamp";
import { MarketDataUnavailable } from "./MarketDataUnavailable";
import { MarketPrice } from "./MarketPrice";
import { MarketStatusBadge } from "./MarketStatusBadge";
import { getInstrument } from "@/constants/instruments";
import type { MarketQuote } from "@/types/market-data";
import type { Locale } from "@/lib/i18n/config";

export function MarketDataCard({
  quote,
  compact = false,
  locale = "en",
}: {
  quote: MarketQuote;
  compact?: boolean;
  locale?: Locale;
}) {
  const instrument = getInstrument(quote.instrumentSlug);
  const spanish = locale === "es";
  const instrumentNames: Record<string, string> = {
    Gold: "Oro",
    Silver: "Plata",
    "WTI Crude Oil": "Petróleo crudo WTI",
  };
  const instrumentName = instrument?.name ?? quote.instrumentSlug;
  return (
    <article className={`md-card${compact ? " md-card-compact" : ""}`}>
      <header>
        <div>
          <span>{quote.symbol}</span>
          <h3>
            {spanish
              ? (instrumentNames[instrumentName] ?? instrumentName)
              : instrumentName}
          </h3>
        </div>
        <MarketStatusBadge status={quote.marketStatus} locale={locale} />
      </header>
      {quote.price === null ? (
        <MarketDataUnavailable instrument={instrumentName} locale={locale} />
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
            locale={locale}
          />
          {!compact ? (
            <dl>
              <div>
                <dt>{spanish ? "Máximo del día" : "Day high"}</dt>
                <dd>
                  {quote.dayHigh ?? (spanish ? "No disponible" : "Unavailable")}
                </dd>
              </div>
              <div>
                <dt>{spanish ? "Mínimo del día" : "Day low"}</dt>
                <dd>
                  {quote.dayLow ?? (spanish ? "No disponible" : "Unavailable")}
                </dd>
              </div>
            </dl>
          ) : null}
          <MarketDataTimestamp
            value={quote.providerTimestamp}
            receivedAt={quote.receivedAt}
            locale={locale}
          />
        </>
      )}
      <MarketDataDisclosure quote={quote} locale={locale} />
      <small className="md-provider">
        {spanish ? "Fuente" : "Source"}: {quote.provider}
      </small>
    </article>
  );
}
