import type { ChartCandle } from "@/types/chart";
import { CHART_TIMEFRAME_SECONDS } from "../chartTimeframes";
import { normalizeCandles } from "../chartCandles";
import type { ChartDatafeed, ChartRange } from "./ChartDatafeed";

export class DevelopmentChartDatafeed implements ChartDatafeed {
  readonly id = "development";
  async getBars(range: ChartRange) {
    const step = CHART_TIMEFRAME_SECONDS[range.timeframe];
    const count = Math.min(
      range.limit,
      Math.floor((range.to - range.from) / step),
    );
    const seed = [...range.instrument].reduce(
      (sum, character) => sum + character.charCodeAt(0),
      0,
    );
    const base = 50 + (seed % 2_000);
    const bars: ChartCandle[] = Array.from({ length: count }, (_, index) => {
      const timestamp = range.to - (count - index) * step;
      const open = base + Math.sin(index / 4) * base * 0.012 + index * 0.03;
      const close = open + Math.sin(index * 1.7) * base * 0.002;
      return {
        timestamp,
        open,
        high: Math.max(open, close) + base * 0.0015,
        low: Math.min(open, close) - base * 0.0015,
        close,
        volume: 1_000 + ((seed * (index + 1)) % 9_000),
        source: "development",
        delayed: true,
        fixture: true,
        receivedAt: new Date(0).toISOString(),
      };
    });
    return {
      data: normalizeCandles(bars),
      meta: {
        instrument: range.instrument,
        timeframe: range.timeframe,
        delayed: true,
        fixture: true,
        source: this.id,
        marketStatus: "development_fixture",
        generatedAt: new Date(0).toISOString(),
      },
    };
  }
}
