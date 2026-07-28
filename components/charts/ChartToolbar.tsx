"use client";
import { INSTRUMENTS } from "@/constants/instruments";
import { CHART_INDICATORS } from "@/lib/charts/chartIndicators";
import { CHART_TIMEFRAME_LABELS } from "@/lib/charts/chartTimeframes";
import type { ChartIndicatorId } from "@/types/chart-indicator";
import type { ChartTimeframe } from "@/types/chart-timeframe";

export function ChartToolbar({
  instrument,
  timeframe,
  supportedTimeframes,
  indicators,
  onInstrument,
  onTimeframe,
  onIndicator,
}: {
  instrument: string;
  timeframe: ChartTimeframe;
  supportedTimeframes: ChartTimeframe[];
  indicators: ChartIndicatorId[];
  onInstrument: (value: string) => void;
  onTimeframe: (value: ChartTimeframe) => void;
  onIndicator: (value: ChartIndicatorId) => void;
}) {
  return (
    <div className="chart-toolbar" aria-label="Chart controls">
      <label>
        Instrument
        <select
          value={instrument}
          onChange={(event) => onInstrument(event.target.value)}
        >
          {INSTRUMENTS.map((item) => (
            <option value={item.slug} key={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Timeframe
        <select
          value={timeframe}
          onChange={(event) =>
            onTimeframe(event.target.value as ChartTimeframe)
          }
        >
          {supportedTimeframes.map((item) => (
            <option value={item} key={item}>
              {CHART_TIMEFRAME_LABELS[item]}
            </option>
          ))}
        </select>
      </label>
      <div className="chart-indicator-controls">
        <span>Indicators</span>
        {Object.entries(CHART_INDICATORS).map(([id, definition]) => (
          <button
            type="button"
            aria-pressed={indicators.includes(id as ChartIndicatorId)}
            onClick={() => onIndicator(id as ChartIndicatorId)}
            key={id}
          >
            {definition.name}
            {definition.premium ? " · Premium" : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
