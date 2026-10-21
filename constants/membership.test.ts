import { describe, expect, it } from "vitest";
import {
  annualMonthlyEquivalent,
  annualSavingsPercent,
  MEMBERSHIP_PLANS,
} from "./membership";

describe("membership pricing", () => {
  it("prices Premium at €49.99 a month and €249.99 a year", () => {
    expect(MEMBERSHIP_PLANS.monthly.amount).toBe(49.99);
    expect(MEMBERSHIP_PLANS.annual.amount).toBe(249.99);
  });

  it("shows the annual saving and monthly equivalent", () => {
    expect(annualSavingsPercent()).toBe(58);
    expect(annualMonthlyEquivalent()).toBe(20.83);
  });
});
