"use client";
import { useState } from "react";
import type { Alert } from "@/types/alert";
import { createAlertAction, updateAlertAction } from "@/app/alerts/actions";
import { AlertTypeSelector } from "./AlertTypeSelector";
import { AlertConditionFields } from "./AlertConditionFields";
import { AlertChannelSelector } from "./AlertChannelSelector";
export function AlertForm({
  alert,
  emailAllowed,
  instrument,
  eventId,
  defaultType,
  threshold,
}: {
  alert?: Alert | null;
  emailAllowed: boolean;
  instrument?: string;
  eventId?: string;
  defaultType?: string;
  threshold?: string;
}) {
  const [selectedType, setSelectedType] = useState(
    alert?.alertType ?? defaultType ?? "price_above",
  );
  const operator =
    selectedType === "economic_event_upcoming"
      ? "scheduled_within"
      : selectedType === "economic_event_released"
        ? "released"
        : selectedType.startsWith("new_")
          ? "published"
          : selectedType === "market_bias_changed"
            ? "changed"
            : "gt";
  return (
    <form
      action={alert ? updateAlertAction : createAlertAction}
      className="smart-form alert-form"
    >
      <input type="hidden" name="id" value={alert?.id ?? ""} />
      <label htmlFor="alert-name">
        Alert name
        <input
          id="alert-name"
          name="name"
          required
          maxLength={100}
          defaultValue={alert?.name ?? ""}
        />
      </label>
      <AlertTypeSelector
        value={selectedType}
        onChange={(event) => setSelectedType(event.target.value)}
      />
      <AlertConditionFields
        key={selectedType}
        alert={alert}
        instrument={instrument}
        eventId={eventId}
        threshold={threshold}
        defaultOperator={operator}
        alertType={selectedType}
      />
      <label htmlFor="alert-cooldown">
        Cooldown in minutes
        <input
          id="alert-cooldown"
          name="cooldownMinutes"
          type="number"
          min={15}
          max={10080}
          defaultValue={alert?.cooldownMinutes ?? 60}
        />
      </label>
      <label htmlFor="alert-expiration">
        Expiration <span>(optional)</span>
        <input id="alert-expiration" name="expiresAt" type="datetime-local" />
      </label>
      <AlertChannelSelector
        emailAllowed={emailAllowed}
        defaults={alert?.channels}
      />
      <p className="smart-disclosure">
        Price alerts require verified, sufficiently fresh, non-simulated data.
        Delayed data remains labeled delayed. Alerts are educational tools, not
        trading recommendations.
      </p>
      <button className="button" type="submit">
        {alert ? "Save alert" : "Create alert"}
      </button>
    </form>
  );
}
