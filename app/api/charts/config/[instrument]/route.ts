import { getChartConfig } from "@/lib/charts/chartConfig";
import { resolveChartSymbol } from "@/lib/charts/chartSymbols";
import { CHART_INDICATORS } from "@/lib/charts/chartIndicators";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ instrument: string }> },
) {
  const instrument = resolveChartSymbol((await params).instrument);
  if (!instrument)
    return Response.json(
      { message: "Chart instrument not found." },
      { status: 404 },
    );
  const config = getChartConfig();
  return Response.json({
    data: {
      instrument: {
        slug: instrument.slug,
        symbol: instrument.symbol,
        name: instrument.name,
        tradingViewSymbol: instrument.tradingViewSymbol,
        defaultTimeframe: instrument.defaultTimeframe,
        supportedTimeframes: instrument.supportedTimeframes,
        delayedByDefault: instrument.delayedByDefault,
        timezone: instrument.timezone,
      },
      provider: config.provider,
      tradingViewEnabled: config.tradingViewEnabled,
      indicators: CHART_INDICATORS,
    },
  });
}
