import { requireChartAccess } from "@/lib/charts/chartAuthorization";
import { normalizeChartError, ChartError } from "@/lib/charts/chartErrors";
import {
  getChartPreference,
  saveChartPreference,
} from "@/lib/charts/chartRepository";
import { parseChartPreference } from "@/lib/charts/chartValidation";
import { resolveChartSymbol } from "@/lib/charts/chartSymbols";
import { enforceMutationRateLimit } from "@/lib/mutationRateLimit";

export async function GET(request: Request) {
  try {
    const access = await requireChartAccess();
    const instrument =
      new URL(request.url).searchParams.get("instrument") ?? "";
    if (!resolveChartSymbol(instrument))
      throw new ChartError("INVALID_REQUEST", "Invalid chart instrument.", 400);
    return Response.json({
      data: await getChartPreference(access.userId, instrument),
    });
  } catch (error) {
    const normalized = normalizeChartError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}
export async function PATCH(request: Request) {
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site")
      throw new ChartError("FORBIDDEN", "Request not allowed.", 403);
    const access = await requireChartAccess();
    enforceMutationRateLimit(access.userId, "chart-preferences", 30);
    const preference = parseChartPreference(await request.json());
    if (!access.premium) preference.showAlertLevels = false;
    await saveChartPreference(access.userId, preference);
    return Response.json({ data: preference });
  } catch (error) {
    const normalized = normalizeChartError(error);
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status },
    );
  }
}
