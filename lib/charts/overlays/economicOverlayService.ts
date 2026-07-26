import type { ChartAnnotation } from "@/types/chart";
import type { EconomicEvent } from "@/types/economic-event";
export function normalizeEconomicAnnotations(events: EconomicEvent[]) {
  return events
    .filter((event) => event.status !== "cancelled")
    .slice(0, 20)
    .map((event): ChartAnnotation => ({
      id: `economic:${event.id}`,
      kind: "economic_event",
      label: `${event.title} · ${event.status}`,
      value: null,
      timestamp: event.scheduledTime,
      sourceId: event.id,
      sourceType: "economic_event",
      premium: false,
    }));
}
