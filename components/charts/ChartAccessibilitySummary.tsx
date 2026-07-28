import type { ChartCandle } from "@/types/chart";
import type { ChartIndicatorConfig } from "@/types/chart-indicator";
import type { ChartTimeframe } from "@/types/chart-timeframe";
export function ChartAccessibilitySummary({
  name,
  timeframe,
  bars,
  indicators,
  delayed,
}: {
  name: string;
  timeframe: ChartTimeframe;
  bars: ChartCandle[];
  indicators: ChartIndicatorConfig[];
  delayed: boolean;
}) {
  const latest = bars.at(-1);
  return (
    <section
      className="chart-accessibility-summary"
      aria-labelledby="chart-summary-title"
    >
      <h2 id="chart-summary-title">Accessible chart summary</h2>
      <dl>
        <div>
          <dt>Instrument</dt>
          <dd>{name}</dd>
        </div>
        <div>
          <dt>Timeframe</dt>
          <dd>{timeframe}</dd>
        </div>
        <div>
          <dt>Latest available close</dt>
          <dd>{latest?.close ?? "Unavailable"}</dd>
        </div>
        <div>
          <dt>Data timestamp</dt>
          <dd>
            {latest
              ? new Date(latest.timestamp * 1_000).toISOString()
              : "Unavailable"}
          </dd>
        </div>
        <div>
          <dt>Data status</dt>
          <dd>{delayed ? "Delayed" : "Provider status unavailable"}</dd>
        </div>
        <div>
          <dt>Indicators</dt>
          <dd>
            {indicators.map((item) => item.id.toUpperCase()).join(", ") ||
              "None"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
