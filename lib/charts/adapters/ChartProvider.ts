import type { ChartAnnotation, ChartProviderId } from "@/types/chart";
import type { ChartIndicatorConfig } from "@/types/chart-indicator";
import type { ChartTimeframe } from "@/types/chart-timeframe";

export type ChartProviderState = {
  instrumentSlug: string;
  timeframe: ChartTimeframe;
  indicators: ChartIndicatorConfig[];
  annotations: ChartAnnotation[];
};
export interface ChartProvider {
  readonly id: ChartProviderId;
  initializeChart(): void;
  destroyChart(): void;
  changeSymbol(instrumentSlug: string): void;
  changeTimeframe(timeframe: ChartTimeframe): void;
  addIndicator(indicator: ChartIndicatorConfig): void;
  removeIndicator(id: string): void;
  resize(): void;
  captureState(): ChartProviderState;
}
