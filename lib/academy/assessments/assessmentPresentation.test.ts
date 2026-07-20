import { describe, expect, it } from "vitest";
import type { AcademyPublicQuestion } from "@/types/academy";
import {
  countUnansweredAssessmentQuestions,
  normalizeAssessmentSubmission,
} from "./assessmentPresentation";

const questions: AcademyPublicQuestion[] = [
  {
    answers: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ],
    difficulty: "beginner",
    id: "single",
    partialCredit: false,
    points: 1,
    prompt: "Choose",
    questionType: "single-choice",
    tags: [],
  },
  {
    answers: [],
    difficulty: "beginner",
    id: "numeric",
    partialCredit: false,
    points: 1,
    prompt: "Number",
    questionType: "numeric",
    tags: [],
  },
];

describe("assessment presentation", () => {
  it("counts unanswered questions without treating zero as empty", () => {
    expect(
      countUnansweredAssessmentQuestions(questions, { numeric: "0" }),
    ).toBe(1);
  });

  it("normalizes numeric values and drops unknown answer IDs", () => {
    expect(
      normalizeAssessmentSubmission(questions, {
        numeric: "-2.5",
        single: "not-assigned",
        unexpected: "value",
      }),
    ).toEqual({ numeric: -2.5 });
  });
});
