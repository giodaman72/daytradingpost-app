import { resolveChartSymbol } from "./chartSymbols";
import { isChartTimeframe } from "./chartTimeframes";
import { validateIndicator } from "./chartIndicators";
import { stripMarkup } from "@/lib/security/plainText";
import type { ChartAnnotation } from "@/types/chart";
import type { ChartIndicatorConfig } from "@/types/chart-indicator";

export function normalizeChartAssistantContext(input: {
  instrumentSlug: string;
  timeframe: string;
  indicators: ChartIndicatorConfig[];
  annotations: ChartAnnotation[];
  dataTimestamp: string | null;
  delayed: boolean;
}) {
  const instrument = resolveChartSymbol(input.instrumentSlug);
  if (!instrument || !isChartTimeframe(input.timeframe)) return null;
  return {
    instrument: instrument.slug,
    timeframe: input.timeframe,
    indicators: input.indicators
      .map((item) => validateIndicator(item, true))
      .filter(Boolean)
      .map((item) => item!.id),
    annotations: input.annotations.slice(0, 20).map((item) => ({
      kind: item.kind,
      label: stripMarkup(item.label).slice(0, 120),
      value: item.value,
      sourceId: item.sourceId,
    })),
    dataTimestamp: input.dataTimestamp,
    delayed: input.delayed,
  };
}
