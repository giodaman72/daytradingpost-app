"use client";

import { useState } from "react";
import type { AcademyLearnerPreferences } from "@/types/academy";
import {
  academyIdempotencyKey,
  recordAcademyClientEvent,
} from "../academyClient";

const fields = [
  ["courseReminders", "Course reminders"],
  ["completionNotifications", "Course and module completion"],
  ["assessmentNotifications", "Assessment results and expiry"],
  ["certificateNotifications", "Certificate issuance"],
  ["academyAnnouncements", "New Academy content"],
  ["emailEnabled", "Email delivery (when a provider is configured)"],
] as const;

export function AcademyNotificationPreferences({
  initial,
}: {
  initial: AcademyLearnerPreferences;
}) {
  const [preferences, setPreferences] = useState(initial);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/academy/preferences", {
        body: JSON.stringify(preferences),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      });
      const payload = (await response.json()) as {
        data?: AcademyLearnerPreferences;
        message?: string;
      };
      if (response.ok && payload.data) {
        setPreferences(payload.data);
        setStatus("Preferences saved.");
        recordAcademyClientEvent({
          idempotencyKey: academyIdempotencyKey("academy-preference-changed"),
          name: "academy_preference_changed",
        });
      } else setStatus(payload.message ?? "Preferences could not be saved.");
    } catch {
      setStatus("Network error. Please try saving again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dashboard-panel academy-preferences">
      <h2>Academy notification preferences</h2>
      <p>
        Dashboard notifications remain the fallback. Email is sent only when you
        enable it and a delivery provider is configured.
      </p>
      <div className="academy-preference-list">
        {fields.map(([key, label]) => (
          <label key={key}>
            <input
              checked={preferences[key]}
              disabled={preferences.unsubscribedAll && key === "emailEnabled"}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  [key]: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <span>{label}</span>
          </label>
        ))}
        <label>
          <input
            checked={preferences.unsubscribedAll}
            onChange={(event) =>
              setPreferences((current) => ({
                ...current,
                emailEnabled: event.target.checked
                  ? false
                  : current.emailEnabled,
                unsubscribedAll: event.target.checked,
              }))
            }
            type="checkbox"
          />
          <span>Pause all Academy notifications</span>
        </label>
      </div>
      <label className="academy-interests-field">
        Learning interests
        <span>
          Optional comma-separated Academy topics, such as risk, gold or
          technical analysis.
        </span>
        <input
          maxLength={600}
          onChange={(event) =>
            setPreferences((current) => ({
              ...current,
              interests: event.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
                .slice(0, 20),
            }))
          }
          value={preferences.interests.join(", ")}
        />
      </label>
      <button className="button" disabled={saving} onClick={save} type="button">
        {saving ? "Saving…" : "Save preferences"}
      </button>
      <p aria-live="polite" role="status">
        {status}
      </p>
    </section>
  );
}
