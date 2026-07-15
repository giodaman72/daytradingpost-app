import { NextResponse } from "next/server";
import { formatMarketDataResponse } from "@/lib/market-data/marketDataMapper";
import { getMarketQuotes } from "@/lib/market-data/marketDataService";
import { parseInstrumentList } from "@/lib/market-data/marketDataValidation";
import { checkPublicApiRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const retryAfter = checkPublicApiRateLimit(request);
  if (retryAfter) {
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
  }

  const parsed = parseInstrumentList(
    new URL(request.url).searchParams.get("instruments"),
  );
  if (!parsed.valid) {
    return NextResponse.json(
      { error: "Invalid instruments", details: parsed.errors },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const quotes = await getMarketQuotes(parsed.instruments);
  return NextResponse.json(formatMarketDataResponse(quotes), {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
