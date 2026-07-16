import { NextResponse } from "next/server";
import {
  formatEconomicResponse,
  getUpcomingEconomicEvents,
} from "@/lib/economic/economicService";
import { checkPublicApiRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const retryAfter = checkPublicApiRateLimit(request);
  if (retryAfter)
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  const limit = Math.min(
    50,
    Math.max(
      1,
      Number(new URL(request.url).searchParams.get("limit") ?? 10) || 10,
    ),
  );
  return NextResponse.json(
    formatEconomicResponse(await getUpcomingEconomicEvents(limit)),
    {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    },
  );
}
