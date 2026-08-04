import Link from "next/link";
import { MarketOutlookGrid } from "@/components/market-intelligence/MarketOutlookGrid";
import { MarketDataGrid } from "@/components/market-data/MarketDataGrid";
import type { MarketQuote } from "@/types/market-data";
import type { MarketIntelligenceSummary } from "@/types/market-intelligence";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardPanel } from "./DashboardPanel";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export function MarketOutlook({
  outlooks,
  quotes,
  locale = "en",
}: {
  outlooks: MarketIntelligenceSummary[];
  quotes: MarketQuote[];
  locale?: Locale;
}) {
  const spanish = locale === "es";
  return (
    <DashboardPanel
      id="market-outlook"
      eyebrow={spanish ? "Informe de la sesión" : "Session briefing"}
      title={
        spanish ? "Perspectiva de mercados de hoy" : "Today’s Market Outlook"
      }
      className="dashboard-panel-wide"
      action={
        <Link
          href={localizeHref("/analysis", locale)}
          className="dashboard-panel-link"
        >
          {spanish ? "Todos los mercados" : "All markets"} →
        </Link>
      }
    >
      <section
        className="dashboard-market-data"
        aria-labelledby="dashboard-market-data-title"
      >
        <div className="dashboard-subheading">
          <h3 id="dashboard-market-data-title">
            {spanish ? "Resumen de cotizaciones" : "Quote snapshot"}
          </h3>
          <span>
            {spanish
              ? "Datos del proveedor · solo informativos"
              : "Provider data · informational only"}
          </span>
        </div>
        <MarketDataGrid quotes={quotes} compact locale={locale} />
      </section>
      <div className="dashboard-subheading">
        <h3>{spanish ? "Perspectivas editoriales" : "Editorial outlooks"}</h3>
        <span>
          {spanish ? "Análisis independiente" : "Independent research"}
        </span>
      </div>
      {outlooks.length ? (
        <MarketOutlookGrid
          outlooks={outlooks.slice(0, 3)}
          compact
          locale={locale}
        />
      ) : (
        <DashboardEmptyState
          title={
            spanish
              ? "Aún no hay perspectivas publicadas"
              : "No published outlook yet"
          }
          description={
            spanish
              ? "Las perspectivas estructuradas de hoy aparecerán aquí cuando las publique el equipo editorial."
              : "Today’s structured outlooks will appear here when the editorial desk publishes them."
          }
          action={
            <Link
              href={localizeHref("/analysis", locale)}
              className="text-link"
            >
              {spanish
                ? "Explorar el archivo de análisis"
                : "Browse analysis archive"}{" "}
              →
            </Link>
          }
        />
      )}
    </DashboardPanel>
  );
}
