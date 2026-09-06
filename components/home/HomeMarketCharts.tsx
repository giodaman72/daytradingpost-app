"use client";

import { useState } from "react";
import Link from "next/link";
import { INSTRUMENTS } from "@/constants/instruments";
import { TradingViewChart } from "@/components/charts/TradingViewChart";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { translateInstrumentName } from "@/lib/i18n/spanish";
import {
  CHART_TIMEFRAME_LABELS,
  CHART_TIMEFRAME_LABELS_ES,
  isChartTimeframe,
} from "@/lib/charts/chartTimeframes";

const markets = INSTRUMENTS.filter(
  (item) => item.enabled && item.chartAvailable,
);

export function HomeMarketCharts({
  locale,
  enabled,
}: {
  locale: Locale;
  enabled: boolean;
}) {
  const [slug, setSlug] = useState("gold");
  const [timeframe, setTimeframe] =
    useState<import("@/types/chart-timeframe").ChartTimeframe>("1h");
  const instrument = markets.find((item) => item.slug === slug) ?? markets[0];
  const spanish = locale === "es";
  const name = spanish
    ? translateInstrumentName(instrument.name)
    : instrument.name;
  const labels = spanish ? CHART_TIMEFRAME_LABELS_ES : CHART_TIMEFRAME_LABELS;

  return (
    <section
      className="home-market-charts reference-shell"
      id="charts"
      aria-labelledby="home-charts-title"
    >
      <div className="home-charts-heading">
        <div>
          <span className="section-kicker">
            {spanish ? "Gráficos de mercados" : "Market charts"}
          </span>
          <h2 id="home-charts-title">
            {spanish
              ? "Una visión más clara del mercado."
              : "A clearer view of the market."}
          </h2>
          <p>
            {spanish
              ? "Explora precios, tendencias y niveles con gráficos interactivos."
              : "Explore prices, trends and key levels with interactive charts."}
          </p>
        </div>
        <Link
          className="text-link"
          href={localizeHref("/research/backtesting", locale)}
        >
          {spanish ? "Abrir Quant Research →" : "Open Quant Research →"}
        </Link>
      </div>
      <div className="home-charts-panel">
        <div className="home-charts-controls">
          <label>
            {spanish ? "Mercado" : "Market"}
            <select
              value={instrument.slug}
              onChange={(event) => {
                const next = markets.find(
                  (item) => item.slug === event.target.value,
                );
                if (!next) return;
                setSlug(next.slug);
                if (!next.supportedTimeframes.includes(timeframe))
                  setTimeframe(next.defaultTimeframe);
              }}
            >
              {markets.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {spanish ? translateInstrumentName(item.name) : item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {spanish ? "Intervalo" : "Timeframe"}
            <select
              value={timeframe}
              onChange={(event) => {
                if (isChartTimeframe(event.target.value))
                  setTimeframe(event.target.value);
              }}
            >
              {instrument.supportedTimeframes.map((value) => (
                <option key={value} value={value}>
                  {labels[value]}
                </option>
              ))}
            </select>
          </label>
          <Link
            className="reference-secondary-cta"
            href={localizeHref(`/charts/${instrument.slug}`, locale)}
          >
            {spanish ? "Abrir gráfico avanzado →" : "Open advanced chart →"}
          </Link>
        </div>
        {enabled ? (
          <TradingViewChart
            key={`${instrument.slug}-${timeframe}`}
            symbol={instrument.tradingViewSymbol}
            timeframe={timeframe}
            name={name}
            locale={locale}
          />
        ) : (
          <p role="status" className="chart-unavailable">
            {spanish
              ? "Los gráficos integrados no están disponibles. Abre el gráfico avanzado para consultar las opciones de datos."
              : "Embedded charts are unavailable. Open the advanced chart for available data options."}
          </p>
        )}
      </div>
    </section>
  );
}
