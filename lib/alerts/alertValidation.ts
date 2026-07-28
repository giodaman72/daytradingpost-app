import { getInstrument } from "@/constants/instruments";
import {
  ADVANCED_ALERT_TYPES,
  ALERT_DEFAULT_COOLDOWN_MINUTES,
  ALERT_MAX_COOLDOWN_MINUTES,
  ALERT_MIN_COOLDOWN_MINUTES,
} from "@/constants/smart-alerts";
import {
  ALERT_CHANNELS,
  ALERT_OPERATORS,
  ALERT_TYPES,
  type AlertChannel,
  type AlertConditionOperator,
  type AlertType,
  type CreateAlertInput,
} from "@/types/alert";

const PRICE_TYPES: AlertType[] = [
  "price_above",
  "price_below",
  "percentage_change_above",
  "percentage_change_below",
  "support_level_reached",
  "resistance_level_reached",
];
const ECONOMIC_TYPES: AlertType[] = [
  "economic_event_upcoming",
  "economic_event_released",
];
function normalizeFutureDate(value: unknown) {
  if (typeof value !== "string" || !value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}
export function normalizeDecimal(value: unknown) {
  const text =
    typeof value === "string" || typeof value === "number"
      ? String(value).trim()
      : "";
  return /^-?\d+(?:\.\d{1,10})?$/.test(text) && Math.abs(Number(text)) <= 1e15
    ? text
    : null;
}
export function validateAlertInput(
  raw: Record<string, unknown>,
  options: { premium: boolean },
) {
  const errors: Record<string, string> = {};
  const alertType = ALERT_TYPES.find((value) => value === raw.alertType) as
    AlertType | undefined;
  const conditionOperator = ALERT_OPERATORS.find(
    (value) => value === raw.conditionOperator,
  ) as AlertConditionOperator | undefined;
  const channels = Array.isArray(raw.channels)
    ? [
        ...new Set(
          raw.channels.filter((value): value is AlertChannel =>
            ALERT_CHANNELS.includes(value as AlertChannel),
          ),
        ),
      ]
    : ["dashboard" as const];
  const name =
    typeof raw.name === "string"
      ? raw.name.trim().replace(/\s+/g, " ").slice(0, 100)
      : "";
  const instrumentSlug =
    typeof raw.instrumentSlug === "string"
      ? (getInstrument(raw.instrumentSlug)?.slug ?? null)
      : null;
  const thresholdValue = normalizeDecimal(raw.thresholdValue);
  const configuredDefault = Number(
    process.env.ALERT_DEFAULT_COOLDOWN_MINUTES ??
      ALERT_DEFAULT_COOLDOWN_MINUTES,
  );
  const defaultCooldown =
    Number.isInteger(configuredDefault) &&
    configuredDefault >= ALERT_MIN_COOLDOWN_MINUTES &&
    configuredDefault <= ALERT_MAX_COOLDOWN_MINUTES
      ? configuredDefault
      : ALERT_DEFAULT_COOLDOWN_MINUTES;
  const cooldown = Number(raw.cooldownMinutes ?? defaultCooldown);
  const expiresAt = normalizeFutureDate(raw.expiresAt);
  if (!alertType) errors.alertType = "Choose a supported alert type.";
  if (!conditionOperator)
    errors.conditionOperator = "Choose a valid condition.";
  if (!name) errors.name = "Enter an alert name.";
  if (!channels.length)
    errors.channels = "Choose at least one notification channel.";
  if (alertType && ADVANCED_ALERT_TYPES.includes(alertType) && !options.premium)
    errors.alertType = "This alert type requires Premium.";
  if (
    alertType &&
    PRICE_TYPES.includes(alertType) &&
    (!instrumentSlug || thresholdValue === null)
  )
    errors.thresholdValue = "Choose an instrument and valid threshold.";
  if (
    alertType &&
    ECONOMIC_TYPES.includes(alertType) &&
    (typeof raw.economicEventId !== "string" || !raw.economicEventId.trim())
  )
    errors.economicEventId = "Choose an economic event.";
  if (alertType === "economic_event_upcoming" && thresholdValue === null)
    errors.thresholdValue = "Choose a reminder window in minutes.";
  if (
    alertType === "economic_event_upcoming" &&
    conditionOperator !== "scheduled_within"
  )
    errors.conditionOperator =
      "Upcoming-event alerts require the scheduled-within condition.";
  if (
    alertType === "economic_event_released" &&
    conditionOperator !== "released"
  )
    errors.conditionOperator = "Release alerts require the released condition.";
  if (channels.includes("email") && !options.premium)
    errors.channels = "Email alerts require Premium.";
  if (
    !Number.isInteger(cooldown) ||
    cooldown < ALERT_MIN_COOLDOWN_MINUTES ||
    cooldown > ALERT_MAX_COOLDOWN_MINUTES
  )
    errors.cooldownMinutes = `Cooldown must be ${ALERT_MIN_COOLDOWN_MINUTES}-${ALERT_MAX_COOLDOWN_MINUTES} minutes.`;
  if (raw.expiresAt && (!expiresAt || Date.parse(expiresAt) <= Date.now()))
    errors.expiresAt = "Expiration must be in the future.";
  const value: CreateAlertInput | null =
    alertType && conditionOperator
      ? {
          alertType,
          conditionOperator,
          name,
          channels,
          instrumentSlug,
          thresholdValue,
          cooldownMinutes: cooldown,
          expiresAt,
          watchlistId:
            typeof raw.watchlistId === "string" && raw.watchlistId
              ? raw.watchlistId
              : null,
          comparisonReference:
            typeof raw.comparisonReference === "string" &&
            raw.comparisonReference
              ? raw.comparisonReference.slice(0, 100)
              : null,
          economicEventId:
            typeof raw.economicEventId === "string" && raw.economicEventId
              ? raw.economicEventId.slice(0, 200)
              : null,
          marketIntelligenceField:
            typeof raw.marketIntelligenceField === "string" &&
            raw.marketIntelligenceField
              ? raw.marketIntelligenceField.slice(0, 80)
              : null,
        }
      : null;
  return { valid: Object.keys(errors).length === 0, value, errors };
}
