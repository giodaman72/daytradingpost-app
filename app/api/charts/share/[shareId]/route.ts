import { normalizeChartError } from "@/lib/charts/chartErrors";
import { getSharedChartLayout } from "@/lib/charts/chartRepository";
import { enforceChartRateLimit } from "@/lib/charts/chartRateLimit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> },
) {
  try {
    enforceChartRateLimit(
      request.headers.get("x-forwarded-for") ?? "anonymous",
    );
    const shareId = (await params).shareId;
    if (!/^[A-Za-z0-9_-]{20,80}$/.test(shareId))
      return Response.json(
        { message: "Shared chart not found." },
        { status: 404 },
      );
    const layout = await getSharedChartLayout(shareId);
    return Response.json({
      data: {
        name: layout.name,
        instrumentSlug: layout.instrumentSlug,
        provider: layout.provider,
        timeframe: layout.timeframe,
        indicators: layout.indicators,
        settings: {
          ...layout.settings,
          showAlertLevels: false,
        },
        createdAt: layout.createdAt,
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
