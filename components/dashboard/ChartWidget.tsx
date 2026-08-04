import Link from "next/link";
import type { InstrumentDefinition } from "@/constants/instruments";
import type { MarketQuote } from "@/types/market-data";
import { DashboardPanel } from "./DashboardPanel";
import { localizeHref, type Locale } from "@/lib/i18n/config";
export function ChartWidget({
  instrument,
  quote,
  locale = "en",
}: {
  instrument: InstrumentDefinition | null;
  quote: MarketQuote | null;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  return (
    <DashboardPanel
      id="advanced-chart"
      eyebrow={spanish ? "Gráfico avanzado" : "Advanced chart"}
      title={
        instrument?.name ?? (spanish ? "Gráfico de mercados" : "Market chart")
      }
    >
      {instrument ? (
        <div className="dashboard-chart-widget">
          <div>
            <strong>
              {quote?.price ?? (spanish ? "No disponible" : "Unavailable")}
            </strong>
            <span>
              {instrument.symbol} ·{" "}
              {quote?.delayed
                ? spanish
                  ? "Con retraso"
                  : "Delayed"
                : quote?.simulated
                  ? spanish
                    ? "Datos simulados"
                    : "Simulated fixture"
                  : (quote?.marketStatus ??
                    (spanish
                      ? "Estado del proveedor no disponible"
                      : "Provider status unavailable"))}
            </span>
          </div>
          <div className="dashboard-chart-placeholder" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <nav
            aria-label={`${instrument.name} ${spanish ? "acciones del gráfico" : "chart actions"}`}
          >
            <Link href={localizeHref(`/charts/${instrument.slug}`, locale)}>
              {spanish ? "Abrir gráfico completo" : "Open full chart"}
            </Link>
            <Link
              href={localizeHref(
                `/alerts/new?instrument=${instrument.slug}`,
                locale,
              )}
            >
              {spanish ? "Crear alerta" : "Create alert"}
            </Link>
            <Link
              href={localizeHref(
                `/analysis?instrument=${instrument.slug}`,
                locale,
              )}
            >
              {spanish ? "Ver análisis" : "View analysis"}
            </Link>
          </nav>
        </div>
      ) : (
        <p>
          {spanish
            ? "Añade un instrumento a tu lista predeterminada para abrir su gráfico."
            : "Add an instrument to your default watchlist to open its chart."}
        </p>
      )}
    </DashboardPanel>
  );
}
