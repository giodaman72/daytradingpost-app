import type { ChartCandle } from "@/types/chart";
import type { ChartIndicatorConfig } from "@/types/chart-indicator";
import type { ChartTimeframe } from "@/types/chart-timeframe";
export function ChartAccessibilitySummary({
  name,
  timeframe,
  bars,
  indicators,
  delayed,
  locale = "en",
}: {
  name: string;
  timeframe: ChartTimeframe;
  bars: ChartCandle[];
  indicators: ChartIndicatorConfig[];
  delayed: boolean;
  locale?: "en" | "es";
}) {
  const spanish = locale === "es";
  const latest = bars.at(-1);
  return (
    <section
      className="chart-accessibility-summary"
      aria-labelledby="chart-summary-title"
    >
      <h2 id="chart-summary-title">
        {spanish ? "Resumen accesible del gráfico" : "Accessible chart summary"}
      </h2>
      <dl>
        <div>
          <dt>{spanish ? "Instrumento" : "Instrument"}</dt>
          <dd>{name}</dd>
        </div>
        <div>
          <dt>{spanish ? "Temporalidad" : "Timeframe"}</dt>
          <dd>{timeframe}</dd>
        </div>
        <div>
          <dt>
            {spanish ? "Último cierre disponible" : "Latest available close"}
          </dt>
          <dd>
            {latest?.close ?? (spanish ? "No disponible" : "Unavailable")}
          </dd>
        </div>
        <div>
          <dt>{spanish ? "Hora de los datos" : "Data timestamp"}</dt>
          <dd>
            {latest
              ? new Date(latest.timestamp * 1_000).toISOString()
              : spanish
                ? "No disponible"
                : "Unavailable"}
          </dd>
        </div>
        <div>
          <dt>{spanish ? "Estado de los datos" : "Data status"}</dt>
          <dd>
            {delayed
              ? spanish
                ? "Retrasados"
                : "Delayed"
              : spanish
                ? "Estado del proveedor no disponible"
                : "Provider status unavailable"}
          </dd>
        </div>
        <div>
          <dt>{spanish ? "Indicadores" : "Indicators"}</dt>
          <dd>
            {indicators.map((item) => item.id.toUpperCase()).join(", ") ||
              (spanish ? "Ninguno" : "None")}
          </dd>
        </div>
      </dl>
    </section>
  );
}
