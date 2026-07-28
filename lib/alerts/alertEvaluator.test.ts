import { describe, expect, it } from "vitest";
import type { Alert } from "@/types/alert";
import { compareDecimals, evaluateAlert } from "./alertEvaluator";
const now = new Date("2026-07-15T12:00:00Z");
const alert: Alert = {
  id: "a1",
  userId: "u1",
  watchlistId: null,
  instrumentSlug: "gold",
  alertType: "price_above",
  name: "Gold",
  conditionOperator: "gt",
  thresholdValue: "2500.10",
  comparisonReference: null,
  economicEventId: null,
  marketIntelligenceField: null,
  channels: ["dashboard"],
  status: "active",
  cooldownMinutes: 60,
  lastEvaluatedAt: null,
  lastTriggeredAt: null,
  expiresAt: null,
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
};
const input = {
  sourceId: "snapshot-1",
  sourceTimestamp: "2026-07-15T11:59:00Z",
  value: "2500.1000000001",
};
describe("alert evaluator", () => {
  it("compares decimals without binary floating point", () => {
    expect(compareDecimals("2500.1000000001", "gt", "2500.10")).toBe(true);
    expect(compareDecimals("0.30", "lte", "0.3")).toBe(true);
  });
  it("evaluates above, below and percentage thresholds", () => {
    expect(evaluateAlert(alert, input, now).triggered).toBe(true);
    expect(
      evaluateAlert(
        { ...alert, alertType: "price_below", conditionOperator: "lt" },
        { ...input, value: "2499" },
        now,
      ).triggered,
    ).toBe(true);
    expect(
      evaluateAlert(
        { ...alert, alertType: "percentage_change_above", thresholdValue: "2" },
        { ...input, value: "2.5" },
        now,
      ).triggered,
    ).toBe(true);
  });
  it("evaluates bias changes and economic reminders", () => {
    expect(
      evaluateAlert(
        {
          ...alert,
          alertType: "market_bias_changed",
          conditionOperator: "changed",
          thresholdValue: null,
        },
        { ...input, value: "bullish", previousValue: "neutral" },
        now,
      ).triggered,
    ).toBe(true);
    expect(
      evaluateAlert(
        {
          ...alert,
          alertType: "economic_event_upcoming",
          conditionOperator: "scheduled_within",
          thresholdValue: "15",
        },
        { ...input, scheduledTime: "2026-07-15T12:10:00Z" },
        now,
      ).triggered,
    ).toBe(true);
  });
  it("respects cooldown and expiration", () => {
    expect(
      evaluateAlert(
        { ...alert, lastTriggeredAt: "2026-07-15T11:30:00Z" },
        input,
        now,
      ).reason,
    ).toContain("cooldown");
    expect(
      evaluateAlert({ ...alert, expiresAt: "2026-07-15T11:00:00Z" }, input, now)
        .reason,
    ).toContain("expired");
  });
  it("rejects stale and simulated inputs and creates stable dedupe keys", () => {
    expect(evaluateAlert(alert, { ...input, stale: true }, now).triggered).toBe(
      false,
    );
    expect(
      evaluateAlert(alert, { ...input, simulated: true }, now).triggered,
    ).toBe(false);
    expect(evaluateAlert(alert, input, now).deduplicationKey).toBe(
      evaluateAlert(alert, input, now).deduplicationKey,
    );
  });
});
