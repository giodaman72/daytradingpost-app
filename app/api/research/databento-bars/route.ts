import { checkPublicApiRateLimit } from "@/lib/rateLimit";
import {
  DatabentoHistoricalDataError,
  getDatabentoDailyBars,
} from "@/lib/backtesting/databentoHistoricalData";
import { isDatabentoResearchSymbol } from "@/lib/backtesting/databentoHistoricalMapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_RANGE_DAYS = 30;
const MAX_RANGE_DAYS = 3_660;

function parseDate(value: string | null) {
  if (!value || !DATE_PATTERN.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
    ? null
    : parsed;
}

export async function GET(request: Request) {
  const retryAfter = checkPublicApiRateLimit(request);
  if (retryAfter)
    return Response.json(
      { code: "RATE_LIMITED", message: "Too many research-data requests." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(retryAfter),
        },
      },
    );

  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol")?.trim().toUpperCase() ?? "";
  const startValue = url.searchParams.get("start");
  const endValue = url.searchParams.get("end");
  const start = parseDate(startValue);
  const end = parseDate(endValue);
  if (!isDatabentoResearchSymbol(symbol))
    return Response.json(
      {
        code: "INVALID_SYMBOL",
        message: "Select ES, NQ, YM, CL, NG, GC, SI, or HG.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  if (!start || !end || end < start)
    return Response.json(
      { code: "INVALID_RANGE", message: "Enter a valid start and end date." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  const rangeDays = Math.ceil((end.getTime() - start.getTime()) / 86_400_000);
  if (rangeDays < MIN_RANGE_DAYS || rangeDays > MAX_RANGE_DAYS)
    return Response.json(
      {
        code: "INVALID_RANGE",
        message: "Choose a historical range between 30 days and 10 years.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );

  try {
    const result = await getDatabentoDailyBars(
      symbol,
      startValue!,
      endValue!,
      request.signal,
    );
    return Response.json(result, {
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    const normalized =
      error instanceof DatabentoHistoricalDataError
        ? error
        : new DatabentoHistoricalDataError(
            "INTERNAL_ERROR",
            "Historical data is temporarily unavailable.",
            500,
          );
    return Response.json(
      { code: normalized.code, message: normalized.message },
      { status: normalized.status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
