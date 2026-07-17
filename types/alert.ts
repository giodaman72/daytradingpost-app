export const ALERT_TYPES = [
  "price_above",
  "price_below",
  "percentage_change_above",
  "percentage_change_below",
  "market_bias_changed",
  "support_level_reached",
  "resistance_level_reached",
  "new_market_analysis",
  "new_market_intelligence",
  "economic_event_upcoming",
  "economic_event_released",
  "webinar_upcoming",
] as const;
export const ALERT_STATUSES = [
  "active",
  "paused",
  "triggered",
  "expired",
  "disabled",
] as const;
export const ALERT_OPERATORS = [
  "gt",
  "gte",
  "lt",
  "lte",
  "changed",
  "published",
  "scheduled_within",
  "released",
] as const;
export const ALERT_CHANNELS = ["dashboard", "email"] as const;
export type AlertType = (typeof ALERT_TYPES)[number];
export type AlertStatus = (typeof ALERT_STATUSES)[number];
export type AlertConditionOperator = (typeof ALERT_OPERATORS)[number];
export type AlertChannel = (typeof ALERT_CHANNELS)[number];
export type Alert = {
  id: string;
  userId: string;
  watchlistId: string | null;
  instrumentSlug: string | null;
  alertType: AlertType;
  name: string;
  conditionOperator: AlertConditionOperator;
  thresholdValue: string | null;
  comparisonReference: string | null;
  economicEventId: string | null;
  marketIntelligenceField: string | null;
  channels: AlertChannel[];
  status: AlertStatus;
  cooldownMinutes: number;
  lastEvaluatedAt: string | null;
  lastTriggeredAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};
export type CreateAlertInput = Pick<
  Alert,
  "alertType" | "channels" | "conditionOperator" | "name"
> &
  Partial<
    Pick<
      Alert,
      | "comparisonReference"
      | "cooldownMinutes"
      | "economicEventId"
      | "expiresAt"
      | "instrumentSlug"
      | "marketIntelligenceField"
      | "thresholdValue"
      | "watchlistId"
    >
  >;
export type UpdateAlertInput = Partial<CreateAlertInput>;
export type AlertEvaluationInput = {
  sourceId: string;
  sourceTimestamp: string;
  value?: string | null;
  previousValue?: string | null;
  delayed?: boolean;
  simulated?: boolean;
  stale?: boolean;
  eventStatus?: string;
  scheduledTime?: string;
};
export type AlertEvaluationResult = {
  alertId: string;
  triggered: boolean;
  reason: string;
  deduplicationKey: string | null;
  triggerValue: string | null;
  sourceTimestamp: string;
};
