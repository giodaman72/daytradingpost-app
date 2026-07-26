import { requireChartAccess } from "@/lib/charts/chartAuthorization";
import { normalizeChartError, ChartError } from "@/lib/charts/chartErrors";
import {
  revokeChartShare,
  shareChartLayout,
} from "@/lib/charts/chartRepository";
import { requireLayoutId } from "@/lib/charts/chartValidation";

type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: Context) {
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site")
      throw new ChartError("FORBIDDEN", "Request not allowed.", 403);
    const access = await requireChartAccess();
    if (!access.limits.sharing)
      throw new ChartError(
        "FORBIDDEN",
        "Chart sharing requires premium access.",
        403,
      );
    return Response.json({
      data: await shareChartLayout(
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
export async function DELETE(request: Request, { params }: Context) {
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site")
      throw new ChartError("FORBIDDEN", "Request not allowed.", 403);
    const access = await requireChartAccess();
    await revokeChartShare(access.userId, requireLayoutId((await params).id));
    return new Response(null, { status: 204 });
  } catch (error) {
    const normalized = normalizeChartError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}
