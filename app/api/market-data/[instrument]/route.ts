import { NextResponse } from "next/server";
import { formatMarketDataResponse } from "@/lib/market-data/marketDataMapper";
import { getMarketQuote } from "@/lib/market-data/marketDataService";
import { validateInstrument } from "@/lib/market-data/marketDataValidation";
import { checkPublicApiRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ instrument: string }> },
) {
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

  const { instrument: requested } = await params;
  const instrument = validateInstrument(requested);
  if (!instrument) {
    return NextResponse.json(
      { error: "Unsupported instrument", details: [requested] },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const quote = await getMarketQuote(instrument);
  return NextResponse.json(formatMarketDataResponse([quote]), {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
