export function MarketDataTimestamp({
  value,
  receivedAt,
}: {
  value: string | null;
  receivedAt: string;
}) {
  const timestamp = value ?? receivedAt;
  return (
    <time className="md-timestamp" dateTime={timestamp}>
      Provider timestamp:{" "}
      {new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/New_York",
      }).format(new Date(timestamp))}{" "}
      ET
    </time>
  );
}
