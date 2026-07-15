import { NextResponse } from "next/server";
import { getMarketDataHealth } from "@/lib/market-data/marketDataService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getMarketDataHealth();
  return NextResponse.json(
    { data: health },
    {
      status: health.healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
