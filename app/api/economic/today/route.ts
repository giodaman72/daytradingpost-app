import { NextResponse } from "next/server";
import {
  formatEconomicResponse,
  getEconomicToday,
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
  return NextResponse.json(formatEconomicResponse(await getEconomicToday()), {
    headers: {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
    },
  });
}
