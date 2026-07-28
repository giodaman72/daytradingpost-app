import { getInstrument } from "@/constants/instruments";
import type { ChartTimeframe } from "@/types/chart-timeframe";

export function resolveChartSymbol(slug: string, timeframe?: ChartTimeframe) {
  const instrument = getInstrument(slug);
  if (!instrument || !instrument.chartAvailable) return null;
  if (timeframe && !instrument.supportedTimeframes.includes(timeframe))
    return null;
  return instrument;
}
