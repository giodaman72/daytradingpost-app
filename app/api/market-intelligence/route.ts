import { NextResponse } from "next/server";
import { getLatestMarketIntelligence } from "@/lib/market/marketIntelligenceService";
import { formatMarketIntelligenceResponse } from "@/lib/market/marketIntelligenceTransforms";
import { parseMarketIntelligenceFilters } from "@/lib/market/marketIntelligenceValidation";
import { checkMarketApiRateLimit } from "@/lib/market/marketIntelligenceRateLimit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const retryAfter = checkMarketApiRateLimit(request);
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
  const parsed = parseMarketIntelligenceFilters(
    new URL(request.url).searchParams,
  );
  if (!parsed.valid) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.errors },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const records = await getLatestMarketIntelligence(parsed.filters);
  return NextResponse.json(formatMarketIntelligenceResponse(records), {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
