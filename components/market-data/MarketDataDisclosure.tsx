import type { MarketQuote } from "@/types/market-data";

export function MarketDataDisclosure({ quote }: { quote: MarketQuote }) {
  const label = quote.simulated
    ? "Simulated"
    : quote.freshness === "stale"
      ? "Stale cache"
      : quote.delayed
        ? "Delayed"
        : quote.freshness === "unavailable"
          ? "Unavailable"
          : "Provider data";
  return (
    <p className={`md-disclosure md-disclosure-${quote.freshness}`} role="note">
      <strong>{label}:</strong> {quote.disclosure} Informational use only.
    </p>
  );
}
