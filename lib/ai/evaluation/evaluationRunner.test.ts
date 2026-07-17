import { describe, expect, it } from "vitest";
import { ASSISTANT_EVALUATION_CASES } from "./evaluationCases";
import { runDeterministicAssistantEvaluation } from "./evaluationRunner";

describe("deterministic assistant evaluation", () => {
  it("covers all 20 required cases without external calls", () => {
    expect(ASSISTANT_EVALUATION_CASES).toHaveLength(20);
    const results = runDeterministicAssistantEvaluation();
    expect(results).toHaveLength(20);
    expect(results.every((result) => result.score === 1)).toBe(true);
  });
});
