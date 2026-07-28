import "server-only";
import {
  getEconomicEventById,
  getUpcomingEconomicEvents,
} from "@/lib/economic";
import type { EconomicEvent } from "@/types/economic-event";
import type { RetrievalDocument } from "@/types/ai-context";

const document = (
  event: EconomicEvent,
  relevance: number,
): RetrievalDocument => ({
  sourceType: "economic_event",
  sourceId: event.id,
  title: `${event.title} (${event.currency})`,
  content: [
    `Scheduled: ${event.scheduledTime}. Status: ${event.status}. Impact: ${event.impact}.`,
    `Actual: ${event.actual ?? "not released"}. Forecast: ${event.forecast ?? "unavailable"}. Previous: ${event.previous ?? "unavailable"}. Revised: ${event.revised ?? "unavailable"}.`,
    event.description ?? "",
    event.educationalExplanation ?? "",
    `Related markets: ${event.relatedMarkets.join(", ") || "not supplied"}.`,
  ]
    .filter(Boolean)
    .join("\n"),
  url: `/economic-calendar/${event.id}`,
  timestamp: event.updatedAt || event.scheduledTime,
  premium: false,
  delayed: false,
  fixture: event.isFixture,
  relevance,
});

export async function retrieveEconomicEvents(eventId: string | null) {
  if (eventId) {
    const event = await getEconomicEventById(eventId);
    return event ? [document(event, 100)] : [];
  }
  const result = await getUpcomingEconomicEvents(5);
  return result.events.map((event, index) => document(event, 65 - index));
}
