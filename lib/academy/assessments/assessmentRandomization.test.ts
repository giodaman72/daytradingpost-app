import { describe, expect, it } from "vitest";
import {
  createAttemptOrdering,
  deterministicShuffle,
} from "./assessmentRandomization";

describe("Academy assessment randomization", () => {
  it("is deterministic for the same attempt seed", () => {
    expect(deterministicShuffle(["a", "b", "c", "d"], "seed")).toEqual(
      deterministicShuffle(["a", "b", "c", "d"], "seed"),
    );
  });

  it("preserves every question and answer", () => {
    const result = createAttemptOrdering(
      ["q1", "q2"],
      { q1: ["a", "b"], q2: ["c", "d"] },
      "seed",
      true,
      true,
    );
    expect(new Set(result.randomizedQuestionIds)).toEqual(
      new Set(["q1", "q2"]),
    );
    expect(new Set(result.randomizedAnswerOrders.q1)).toEqual(
      new Set(["a", "b"]),
    );
  });

  it("preserves editorial order when randomization is disabled", () => {
    expect(
      createAttemptOrdering(
        ["q1", "q2"],
        { q1: ["a", "b"] },
        "seed",
        false,
        false,
      ),
    ).toEqual({
      randomizedAnswerOrders: { q1: ["a", "b"] },
      randomizedQuestionIds: ["q1", "q2"],
    });
  });
});
