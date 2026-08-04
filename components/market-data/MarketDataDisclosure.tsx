import type { MarketQuote } from "@/types/market-data";
import type { Locale } from "@/lib/i18n/config";

export function MarketDataDisclosure({
  quote,
  locale = "en",
}: {
  quote: MarketQuote;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  const label = quote.simulated
    ? spanish
      ? "Simulado"
      : "Simulated"
    : quote.freshness === "stale"
      ? spanish
        ? "Caché desactualizada"
        : "Stale cache"
      : quote.delayed
        ? spanish
          ? "Retrasado"
          : "Delayed"
        : quote.freshness === "unavailable"
          ? spanish
            ? "No disponible"
            : "Unavailable"
          : spanish
            ? "Datos del proveedor"
            : "Provider data";
  return (
    <p className={`md-disclosure md-disclosure-${quote.freshness}`} role="note">
      <strong>{label}:</strong>{" "}
      {spanish
        ? "La disponibilidad y la actualización dependen del proveedor. Solo para uso informativo."
        : `${quote.disclosure} Informational use only.`}
    </p>
  );
}
