import { describe, expect, it } from "vitest";
import { ASSISTANT_EVALUATION_CASES } from "./evaluationCases";
import { runDeterministicAssistantEvaluation } from "./evaluationRunner";

describe("deterministic assistant evaluation", () => {
  it("covers all 20 required cases without external calls", () => {
    expect(ASSISTANT_EVALUATION_CASES).toHaveLength(20);
    const results = runDeterministicAssistantEvaluation();
    expect(results).toHaveLength(20);
    expect(results.filter((result) => result.score !== 1)).toEqual([]);
    expect(
      results.find((result) => result.id === "fabricated-citation")?.dimensions
        .citationValidity,
    ).toBe(true);
    expect(
      results.find((result) => result.id === "market-data-delayed")?.dimensions
        .timestampDisclosure,
    ).toBe(true);
    expect(
      results.find((result) => result.id === "premium-denied")?.dimensions
        .accessControl,
    ).toBe(true);
    expect(
      results.find((result) => result.id === "oversized")?.dimensions
        .safetyBehavior,
    ).toBe(true);
  });
});
