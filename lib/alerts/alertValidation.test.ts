import { describe, expect, it } from "vitest";
import { validateAlertInput } from "./alertValidation";
const base = {
  name: "Gold level",
  alertType: "price_above",
  conditionOperator: "gt",
  thresholdValue: "2500.25",
  instrumentSlug: "gold",
  channels: ["dashboard"],
  cooldownMinutes: 60,
};
describe("alert validation", () => {
  it("accepts a normalized price alert", () => {
    expect(validateAlertInput(base, { premium: false })).toMatchObject({
      valid: true,
      value: { instrumentSlug: "gold", thresholdValue: "2500.25" },
    });
  });
  it("requires economic references", () => {
    expect(
      validateAlertInput(
        {
          ...base,
          alertType: "economic_event_upcoming",
          conditionOperator: "scheduled_within",
          thresholdValue: "60",
          instrumentSlug: "",
        },
        { premium: false },
      ).errors,
    ).toHaveProperty("economicEventId");
  });
  it("enforces advanced and email membership rules", () => {
    const result = validateAlertInput(
      {
        ...base,
        alertType: "market_bias_changed",
        conditionOperator: "changed",
        channels: ["dashboard", "email"],
      },
      { premium: false },
    );
    expect(result.errors).toHaveProperty("alertType");
    expect(result.errors).toHaveProperty("channels");
  });
  it("rejects invalid thresholds and cooldowns", () => {
    expect(
      validateAlertInput(
        { ...base, thresholdValue: "NaN", cooldownMinutes: 1 },
        { premium: true },
      ).valid,
    ).toBe(false);
  });
});
