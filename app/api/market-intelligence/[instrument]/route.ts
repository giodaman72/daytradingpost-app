import { NextResponse } from "next/server";
import { getInstrument } from "@/constants/instruments";
import { getMarketIntelligenceByInstrument } from "@/lib/market/marketIntelligenceService";
import { summarizeMarketIntelligence } from "@/lib/market/marketIntelligenceTransforms";
import { checkMarketApiRateLimit } from "@/lib/market/marketIntelligenceRateLimit";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ instrument: string }> },
) {
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
  const { instrument: requested } = await params;
  const instrument = getInstrument(requested);
  if (!instrument)
    return NextResponse.json(
      { error: "Unsupported instrument" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );

  const record = await getMarketIntelligenceByInstrument(instrument.slug);
  if (!record)
    return NextResponse.json(
      { error: "No published outlook found" },
      { status: 404, headers: { "Cache-Control": "public, s-maxage=30" } },
    );

  return NextResponse.json(
    {
      data: summarizeMarketIntelligence(record),
      meta: { generatedAt: new Date().toISOString(), sampleData: false },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
