export function MarketChange({
  change,
  changePercent,
}: {
  change: string | null;
  changePercent: string | null;
}) {
  if (change === null || changePercent === null)
    return (
      <span className="md-change md-change-flat">Daily change unavailable</span>
    );
  const direction =
    Number(change) > 0 ? "up" : Number(change) < 0 ? "down" : "unchanged";
  const symbol = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
  return (
    <span
      className={`md-change md-change-${direction}`}
      aria-label={`Daily price ${direction} by ${Math.abs(Number(change))}, or ${Math.abs(Number(changePercent))} percent`}
    >
      <span aria-hidden="true">{symbol}</span> {change} ({changePercent}%)
    </span>
  );
}
