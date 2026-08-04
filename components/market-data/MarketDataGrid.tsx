import { MarketDataCard } from "./MarketDataCard";
import { MarketDataUnavailable } from "./MarketDataUnavailable";
import type { MarketQuote } from "@/types/market-data";
import type { Locale } from "@/lib/i18n/config";

export function MarketDataGrid({
  quotes,
  compact = false,
  locale = "en",
}: {
  quotes: MarketQuote[];
  compact?: boolean;
  locale?: Locale;
}) {
  if (!quotes.length) return <MarketDataUnavailable locale={locale} />;
  return (
    <div className={`md-grid${compact ? " md-grid-compact" : ""}`}>
      {quotes.map((quote) => (
        <MarketDataCard
          quote={quote}
          compact={compact}
          locale={locale}
          key={quote.instrumentSlug}
        />
      ))}
    </div>
  );
}
