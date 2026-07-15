import { NextResponse } from "next/server";
import {
  formatEconomicResponse,
  getEconomicEvents,
} from "@/lib/economic/economicService";
import { parseEconomicFilters } from "@/lib/economic/economicValidation";
import { checkPublicApiRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const retryAfter = checkPublicApiRateLimit(request);
  if (retryAfter)
    return NextResponse.json(
      { error: "Rate limit exceeded", details: ["Try again shortly"] },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(retryAfter),
        },
      },
    );
  const parsed = parseEconomicFilters(new URL(request.url).searchParams);
  if (!parsed.valid)
    return NextResponse.json(
      { error: "Invalid query", details: parsed.errors },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  return NextResponse.json(
    formatEconomicResponse(await getEconomicEvents(parsed.filters)),
    {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    },
  );
}
