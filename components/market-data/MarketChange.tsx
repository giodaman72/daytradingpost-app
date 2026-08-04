export function MarketChange({
  change,
  changePercent,
  locale = "en",
}: {
  change: string | null;
  changePercent: string | null;
  locale?: "en" | "es";
}) {
  const spanish = locale === "es";
  if (change === null || changePercent === null)
    return (
      <span className="md-change md-change-flat">
        {spanish
          ? "Variación diaria no disponible"
          : "Daily change unavailable"}
      </span>
    );
  const direction =
    Number(change) > 0 ? "up" : Number(change) < 0 ? "down" : "unchanged";
  const symbol = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
  return (
    <span
      className={`md-change md-change-${direction}`}
      aria-label={
        spanish
          ? `Variación diaria del precio: ${direction}, ${Math.abs(Number(change))}, o ${Math.abs(Number(changePercent))} por ciento`
          : `Daily price ${direction} by ${Math.abs(Number(change))}, or ${Math.abs(Number(changePercent))} percent`
      }
    >
      <span aria-hidden="true">{symbol}</span> {change} ({changePercent}%)
    </span>
  );
}
