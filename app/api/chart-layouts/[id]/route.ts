import { requireChartAccess } from "@/lib/charts/chartAuthorization";
import { normalizeChartError, ChartError } from "@/lib/charts/chartErrors";
import {
  deleteChartLayout,
  getChartLayout,
  updateChartLayout,
} from "@/lib/charts/chartRepository";
import {
  parseLayoutInput,
  requireLayoutId,
} from "@/lib/charts/chartValidation";
import { enforceMutationRateLimit } from "@/lib/mutationRateLimit";

type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  try {
    const access = await requireChartAccess();
    return Response.json({
      data: await getChartLayout(
        access.userId,
        requireLayoutId((await params).id),
      ),
    });
  } catch (error) {
    const normalized = normalizeChartError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}
export async function PATCH(request: Request, { params }: Context) {
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site")
      throw new ChartError("FORBIDDEN", "Request not allowed.", 403);
    const access = await requireChartAccess();
    enforceMutationRateLimit(access.userId, "chart-layouts", 20);
    const input = parseLayoutInput(
      await request.json(),
      access.premium,
      access.limits.indicators,
    );
    return Response.json({
      data: await updateChartLayout(
        access.userId,
        requireLayoutId((await params).id),
        input,
      ),
    });
  } catch (error) {
    const normalized = normalizeChartError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}
export async function DELETE(request: Request, { params }: Context) {
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site")
      throw new ChartError("FORBIDDEN", "Request not allowed.", 403);
    const access = await requireChartAccess();
    enforceMutationRateLimit(access.userId, "chart-layouts", 20);
    await deleteChartLayout(access.userId, requireLayoutId((await params).id));
    return new Response(null, { status: 204 });
  } catch (error) {
    const normalized = normalizeChartError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}
