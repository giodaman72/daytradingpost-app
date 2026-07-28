import { INSTRUMENTS } from "@/constants/instruments";
import type { Alert } from "@/types/alert";
export function AlertConditionFields({
  alert,
  instrument,
  eventId,
  threshold,
  defaultOperator = "gt",
  alertType,
}: {
  alert?: Alert | null;
  instrument?: string;
  eventId?: string;
  threshold?: string;
  defaultOperator?: string;
  alertType: string;
}) {
  const economic = alertType.startsWith("economic_event_");
  const thresholdRequired =
    alertType.startsWith("price_") ||
    alertType.startsWith("percentage_") ||
    alertType.endsWith("level_reached") ||
    alertType === "economic_event_upcoming" ||
    alertType === "webinar_upcoming";
  const instrumentRelevant = !economic && alertType !== "webinar_upcoming";
  const referenceRelevant =
    alertType === "market_bias_changed" ||
    alertType === "new_market_intelligence" ||
    alertType === "new_market_analysis";
  return (
    <>
      {instrumentRelevant ? (
        <label htmlFor="alert-instrument">
          Instrument
          <select
            id="alert-instrument"
            name="instrumentSlug"
            defaultValue={alert?.instrumentSlug ?? instrument ?? ""}
          >
            <option value="">Not instrument-specific</option>
            {INSTRUMENTS.filter((item) => item.enabled).map((item) => (
              <option value={item.slug} key={item.slug}>
                {item.name} · {item.symbol}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label htmlFor="alert-operator">
        Condition
        <select
          id="alert-operator"
          name="conditionOperator"
          defaultValue={alert?.conditionOperator ?? defaultOperator}
        >
          <option value="gt">Greater than</option>
          <option value="gte">Greater than or equal</option>
          <option value="lt">Less than</option>
          <option value="lte">Less than or equal</option>
          <option value="changed">Changed from previous value</option>
          <option value="published">Published</option>
          <option value="scheduled_within">Scheduled within minutes</option>
          <option value="released">Released</option>
        </select>
      </label>
      {thresholdRequired ? (
        <label htmlFor="alert-threshold">
          Threshold or reminder minutes
          <input
            id="alert-threshold"
            name="thresholdValue"
            inputMode="decimal"
            defaultValue={alert?.thresholdValue ?? threshold ?? ""}
            placeholder="Example: 2500 or 60"
          />
        </label>
      ) : null}
      {economic ? (
        <label htmlFor="economic-event-id">
          Economic event identifier
          <input
            id="economic-event-id"
            name="economicEventId"
            defaultValue={alert?.economicEventId ?? eventId ?? ""}
            maxLength={200}
          />
        </label>
      ) : null}
      {referenceRelevant ? (
        <label htmlFor="comparison-reference">
          Previous/reference value
          <input
            id="comparison-reference"
            name="comparisonReference"
            defaultValue={alert?.comparisonReference ?? ""}
            maxLength={100}
          />
        </label>
      ) : null}
    </>
  );
}
