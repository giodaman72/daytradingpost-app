export type AnalyticsEvent = {
  metadata?: Record<string, string | number | boolean | null>;
  name: string;
  occurredAt: string;
};

export function createAnalyticsEvent(
  name: string,
  metadata?: AnalyticsEvent["metadata"],
): AnalyticsEvent {
  return { metadata, name, occurredAt: new Date().toISOString() };
}
