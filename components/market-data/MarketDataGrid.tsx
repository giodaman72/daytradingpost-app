import { MarketDataCard } from "./MarketDataCard";
import { MarketDataUnavailable } from "./MarketDataUnavailable";
import type { MarketQuote } from "@/types/market-data";

export function MarketDataGrid({
  quotes,
  compact = false,
}: {
  quotes: MarketQuote[];
  compact?: boolean;
}) {
  if (!quotes.length) return <MarketDataUnavailable />;
  return (
    <div className={`md-grid${compact ? " md-grid-compact" : ""}`}>
      {quotes.map((quote) => (
        <MarketDataCard
          quote={quote}
          compact={compact}
          key={quote.instrumentSlug}
        />
      ))}
    </div>
  );
}
