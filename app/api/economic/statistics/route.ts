import { NextResponse } from "next/server";
import {
  getEconomicTomorrow,
  getEconomicWeek,
} from "@/lib/economic/economicService";
import { calculateEconomicStatistics } from "@/lib/economic/economicStatistics";
import { checkPublicApiRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const retryAfter = checkPublicApiRateLimit(request);
  if (retryAfter)
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  const now = new Date();
  const [week, tomorrow] = await Promise.all([
    getEconomicWeek(now),
    getEconomicTomorrow(now),
  ]);
  const events = [...week.events, ...tomorrow.events].filter(
    (event, index, all) =>
      all.findIndex((candidate) => candidate.id === event.id) === index,
  );
  return NextResponse.json(
    {
      data: calculateEconomicStatistics(events, now),
      meta: {
        generatedAt: week.generatedAt,
        simulated: week.simulated || tomorrow.simulated,
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    },
  );
}
