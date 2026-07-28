import { describe, expect, it } from "vitest";
import {
  detectPrerequisiteCycle,
  evaluatePrerequisites,
  getNextAvailableLesson,
} from "./prerequisiteEngine";

describe("Academy prerequisite engine", () => {
  it("returns structured unmet requirements", () => {
    expect(
      evaluatePrerequisites(
        [
          { id: "a", kind: "course" },
          { id: "b", kind: "course" },
        ],
        new Set(["a"]),
      ),
    ).toEqual({
      met: false,
      unmet: [{ id: "b", kind: "course" }],
    });
  });

  it("detects a circular chain", () => {
    expect(
      detectPrerequisiteCycle(
        new Map([
          ["a", ["b"]],
          ["b", ["c"]],
          ["c", ["a"]],
        ]),
      ),
    ).not.toBeNull();
  });

  it("allows an acyclic graph", () => {
    expect(
      detectPrerequisiteCycle(
        new Map([
          ["a", []],
          ["b", ["a"]],
          ["c", ["b"]],
        ]),
      ),
    ).toBeNull();
  });

  it("selects the next unlocked lesson", () => {
    expect(
      getNextAvailableLesson(
        ["l1", "l2", "l3"],
        new Set(["l1"]),
        new Map([
          ["l2", ["l1"]],
          ["l3", ["l2"]],
        ]),
      ),
    ).toBe("l2");
  });
});
