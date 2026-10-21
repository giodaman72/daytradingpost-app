import { describe, expect, it } from "vitest";
import {
  annualMonthlyEquivalent,
  annualSavingsPercent,
  MEMBERSHIP_PLANS,
} from "./membership";

describe("membership pricing", () => {
  it("prices Premium at €72.99 a month and €699.99 a year", () => {
    expect(MEMBERSHIP_PLANS.monthly.amount).toBe(72.99);
    expect(MEMBERSHIP_PLANS.annual.amount).toBe(699.99);
  });

  it("shows the annual saving and monthly equivalent", () => {
    expect(annualSavingsPercent()).toBe(20);
    expect(annualMonthlyEquivalent()).toBe(58.33);
  });
});
