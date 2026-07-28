import { getChartConfig } from "@/lib/charts/chartConfig";
import { normalizeChartError } from "@/lib/charts/chartErrors";
import { enforceChartRateLimit } from "@/lib/charts/chartRateLimit";
import { parseBarsQuery } from "@/lib/charts/chartValidation";
import { getChartDatafeed } from "@/lib/charts/datafeeds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const forwarded =
      request.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";
    enforceChartRateLimit(forwarded.trim());
    const config = getChartConfig();
    const range = parseBarsQuery(
      request.url,
      config.maximumBars,
      config.maximumHistoryDays,
    );
    const result = await getChartDatafeed().getBars(range, request.signal);
    return Response.json(result, {
      headers: {
        "Cache-Control": `public, max-age=0, s-maxage=${config.cacheTtlSeconds}`,
      },
    });
  } catch (error) {
    const normalized = normalizeChartError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}
