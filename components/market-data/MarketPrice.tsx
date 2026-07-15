import { getInstrument } from "@/constants/instruments";

export function MarketPrice({
  value,
  currency,
  instrumentSlug,
}: {
  value: string | null;
  currency: string;
  instrumentSlug: string;
}) {
  if (value === null)
    return <span className="md-price-unavailable">Price unavailable</span>;
  const precision = getInstrument(instrumentSlug)?.decimalPrecision ?? 2;
  const amount = Number(value);
  const formatted = Number.isFinite(amount)
    ? new Intl.NumberFormat("en-US", {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }).format(amount)
    : value;
  return (
    <span className="md-price">
      <strong>{formatted}</strong>
      <small>{currency}</small>
    </span>
  );
}
