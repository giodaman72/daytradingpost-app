import { NextResponse } from "next/server";
import { getLatestMarketIntelligence } from "@/lib/market/marketIntelligenceService";
import { buildMarketBrief } from "@/lib/market/marketIntelligenceTransforms";
import { checkPublicApiRateLimit } from "@/lib/rateLimit";
import { getUpcomingEconomicEvents } from "@/lib/economic/economicService";
import { describeEventRisk } from "@/lib/economic/economicImpact";

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
  const [records, economic] = await Promise.all([
    getLatestMarketIntelligence({ limit: 50 }),
    getUpcomingEconomicEvents(6),
  ]);
  return NextResponse.json(
    {
      data: {
        ...buildMarketBrief(records),
        economic: {
          topEvents: economic.events,
          highestImpact: economic.events.filter(
            (event) => event.impact === "high",
          ),
          upcomingReleases: economic.events.map((event) => ({
            id: event.id,
            title: event.title,
            scheduledTime: event.scheduledTime,
          })),
          marketRisks: economic.events.slice(0, 3).map(describeEventRisk),
        },
      },
      meta: { generatedAt: new Date().toISOString(), sampleData: false },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
