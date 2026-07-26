import type {
  ChartIndicatorConfig,
  ChartIndicatorId,
} from "@/types/chart-indicator";

export const CHART_INDICATORS: Record<
  ChartIndicatorId,
  {
    name: string;
    premium: boolean;
    pane: "main" | "separate";
    defaults: Record<string, number>;
  }
> = {
  sma: {
    name: "Simple Moving Average",
    premium: false,
    pane: "main",
    defaults: { period: 20 },
  },
  ema: {
    name: "Exponential Moving Average",
    premium: false,
    pane: "main",
    defaults: { period: 20 },
  },
  bollinger: {
    name: "Bollinger Bands",
    premium: true,
    pane: "main",
    defaults: { period: 20, deviation: 2 },
  },
  rsi: {
    name: "Relative Strength Index",
    premium: false,
    pane: "separate",
    defaults: { period: 14 },
  },
  macd: {
    name: "MACD",
    premium: true,
    pane: "separate",
    defaults: { fast: 12, slow: 26, signal: 9 },
  },
  atr: {
    name: "Average True Range",
    premium: true,
    pane: "separate",
    defaults: { period: 14 },
  },
  volume: { name: "Volume", premium: false, pane: "separate", defaults: {} },
  vwap: { name: "VWAP", premium: true, pane: "main", defaults: {} },
};
export function validateIndicator(
  input: ChartIndicatorConfig,
  premium: boolean,
) {
  const definition = CHART_INDICATORS[input.id];
  if (!definition || (definition.premium && !premium)) return null;
  const parameters: Record<string, number> = {};
  for (const [key, fallback] of Object.entries(definition.defaults)) {
    const value = Number(input.parameters[key] ?? fallback);
    if (!Number.isFinite(value) || value <= 0 || value > 500) return null;
    parameters[key] = value;
  }
  return { id: input.id, parameters } satisfies ChartIndicatorConfig;
}
