import { requireChartAccess } from "@/lib/charts/chartAuthorization";
import { normalizeChartError, ChartError } from "@/lib/charts/chartErrors";
import {
  createChartLayout,
  listChartLayouts,
} from "@/lib/charts/chartRepository";
import { parseLayoutInput } from "@/lib/charts/chartValidation";
import { enforceMutationRateLimit } from "@/lib/mutationRateLimit";

export async function GET() {
  try {
    const access = await requireChartAccess();
    return Response.json({ data: await listChartLayouts(access.userId) });
  } catch (error) {
    const normalized = normalizeChartError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}
export async function POST(request: Request) {
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site")
      throw new ChartError("FORBIDDEN", "Request not allowed.", 403);
    const access = await requireChartAccess();
    enforceMutationRateLimit(access.userId, "chart-layouts", 20);
    const current = await listChartLayouts(access.userId);
    if (current.length >= access.limits.layouts)
      throw new ChartError(
        "LIMIT_REACHED",
        "Your chart layout limit has been reached.",
        403,
      );
    const input = parseLayoutInput(
      await request.json(),
      access.premium,
      access.limits.indicators,
    );
    return Response.json(
      { data: await createChartLayout(access.userId, input) },
      { status: 201 },
    );
  } catch (error) {
    const normalized = normalizeChartError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}
