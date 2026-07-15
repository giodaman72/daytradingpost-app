import { NextResponse } from "next/server";
import { getLatestMarketIntelligence } from "@/lib/market/marketIntelligenceService";
import { buildMarketBrief } from "@/lib/market/marketIntelligenceTransforms";
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
  const records = await getLatestMarketIntelligence({ limit: 50 });
  return NextResponse.json(
    {
      data: buildMarketBrief(records),
      meta: { generatedAt: new Date().toISOString(), sampleData: false },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
