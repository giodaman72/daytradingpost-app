"use client";
import { INSTRUMENTS } from "@/constants/instruments";
import { CHART_INDICATORS } from "@/lib/charts/chartIndicators";
import {
  CHART_TIMEFRAME_LABELS,
  CHART_TIMEFRAME_LABELS_ES,
} from "@/lib/charts/chartTimeframes";
import type { ChartIndicatorId } from "@/types/chart-indicator";
import type { ChartTimeframe } from "@/types/chart-timeframe";
import type { Locale } from "@/lib/i18n/config";
import { translateInstrumentName } from "@/lib/i18n/spanish";

export function ChartToolbar({
  instrument,
  timeframe,
  supportedTimeframes,
  indicators,
  onInstrument,
  onTimeframe,
  onIndicator,
  locale = "en",
}: {
  instrument: string;
  timeframe: ChartTimeframe;
  supportedTimeframes: ChartTimeframe[];
  indicators: ChartIndicatorId[];
  onInstrument: (value: string) => void;
  onTimeframe: (value: ChartTimeframe) => void;
  onIndicator: (value: ChartIndicatorId) => void;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  const indicatorNames: Record<string, string> = {
    "Simple Moving Average": "Media móvil simple",
    "Exponential Moving Average": "Media móvil exponencial",
    "Bollinger Bands": "Bandas de Bollinger",
    "Relative Strength Index": "Índice de fuerza relativa",
    "Average True Range": "Rango verdadero medio",
    Volume: "Volumen",
  };
  return (
    <div
      className="chart-toolbar"
      aria-label={spanish ? "Controles del gráfico" : "Chart controls"}
    >
      <label>
        {spanish ? "Instrumento" : "Instrument"}
        <select
          value={instrument}
          onChange={(event) => onInstrument(event.target.value)}
        >
          {INSTRUMENTS.map((item) => (
            <option value={item.slug} key={item.slug}>
              {spanish ? translateInstrumentName(item.name) : item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {spanish ? "Temporalidad" : "Timeframe"}
        <select
          value={timeframe}
          onChange={(event) =>
            onTimeframe(event.target.value as ChartTimeframe)
          }
        >
          {supportedTimeframes.map((item) => (
            <option value={item} key={item}>
              {
                (spanish ? CHART_TIMEFRAME_LABELS_ES : CHART_TIMEFRAME_LABELS)[
                  item
                ]
              }
            </option>
          ))}
        </select>
      </label>
      <div className="chart-indicator-controls">
        <span>{spanish ? "Indicadores" : "Indicators"}</span>
        {Object.entries(CHART_INDICATORS).map(([id, definition]) => (
          <button
            type="button"
            aria-pressed={indicators.includes(id as ChartIndicatorId)}
            onClick={() => onIndicator(id as ChartIndicatorId)}
            key={id}
          >
            {spanish
              ? (indicatorNames[definition.name] ?? definition.name)
              : definition.name}
            {definition.premium ? " · Premium" : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
