import type { ChartBarsResponse } from "@/types/chart";
import type { ChartTimeframe } from "@/types/chart-timeframe";

export type ChartRange = {
  instrument: string;
  timeframe: ChartTimeframe;
  from: number;
  to: number;
  limit: number;
};
export interface ChartDatafeed {
  readonly id: string;
  getBars(range: ChartRange, signal?: AbortSignal): Promise<ChartBarsResponse>;
}
