import { afterEach, describe, expect, it } from "vitest";
import { getAssistantLimits } from "@/constants/ai-assistant";
import { estimateAssistantCost } from "./assistantConfig";
import {
  canRetrievePremiumSource,
  canUseAssistantMode,
} from "./assistantPolicy";

describe("assistant access and cost policy", () => {
  afterEach(() => {
    delete process.env.AI_INPUT_COST_PER_MILLION;
    delete process.env.AI_OUTPUT_COST_PER_MILLION;
  });
  it("keeps watchlist mode premium and centralizes plan limits", () => {
    expect(canUseAssistantMode("watchlist_summary", false)).toBe(false);
    expect(canUseAssistantMode("watchlist_summary", true)).toBe(true);
    expect(canRetrievePremiumSource(false)).toBe(false);
    expect(canRetrievePremiumSource(true)).toBe(true);
    expect(getAssistantLimits(true).dailyRequests).toBeGreaterThan(
      getAssistantLimits(false).dailyRequests,
    );
  });
  it("does not claim cost until pricing is configured", () => {
    expect(estimateAssistantCost(1000, 1000)).toBeNull();
    process.env.AI_INPUT_COST_PER_MILLION = "2";
    process.env.AI_OUTPUT_COST_PER_MILLION = "8";
    expect(estimateAssistantCost(1000, 1000)).toBe(0.01);
  });
});
