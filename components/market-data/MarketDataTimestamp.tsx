export function MarketDataTimestamp({
  value,
  receivedAt,
  locale = "en",
}: {
  value: string | null;
  receivedAt: string;
  locale?: "en" | "es";
}) {
  const timestamp = value ?? receivedAt;
  return (
    <time className="md-timestamp" dateTime={timestamp}>
      {locale === "es" ? "Hora del proveedor" : "Provider timestamp"}:{" "}
      {new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/New_York",
      }).format(new Date(timestamp))}{" "}
      ET
    </time>
  );
}
