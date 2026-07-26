import "server-only";
import { getChartConfig } from "../chartConfig";
import type { ChartDatafeed } from "./ChartDatafeed";
import { DevelopmentChartDatafeed } from "./developmentChartDatafeed";
import { MarketDataChartDatafeed } from "./marketDataChartDatafeed";

export function getChartDatafeed(): ChartDatafeed {
  return getChartConfig().provider === "development"
    ? new DevelopmentChartDatafeed()
    : new MarketDataChartDatafeed();
}
