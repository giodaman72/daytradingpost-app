import { createAnalyticsEvent } from "@/lib/analytics";
export const CHART_ANALYTICS_EVENTS = [
  "chart_opened",
  "instrument_changed",
  "timeframe_changed",
  "indicator_added",
  "indicator_removed",
  "overlay_toggled",
  "layout_saved",
  "layout_loaded",
  "layout_shared",
  "fullscreen_entered",
  "alert_created_from_chart",
  "analysis_opened_from_chart",
  "assistant_opened_from_chart",
] as const;
export function createChartAnalyticsEvent(
  name: (typeof CHART_ANALYTICS_EVENTS)[number],
  metadata: { instrument?: string; timeframe?: string; provider?: string },
) {
  return createAnalyticsEvent(name, metadata);
}
