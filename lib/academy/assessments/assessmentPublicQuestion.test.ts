import { describe, expect, it } from "vitest";
import type { AcademyQuestion } from "@/types/academy";
import { toPublicAcademyQuestion } from "./assessmentService";

describe("public Academy assessment questions", () => {
  it("removes answer keys, explanations, match mappings, and numeric tolerances", () => {
    const question: AcademyQuestion = {
      answers: [
        {
          id: "a1",
          label: "Support",
          matchKey: "Level A",
          numericTolerance: 2,
        },
      ],
      correctAnswer: { a1: "Level A" },
      difficulty: "beginner",
      explanation: "Private grading explanation",
      id: "q1",
      partialCredit: false,
      points: 1,
      prompt: "Match the concept.",
      questionType: "matching",
      tags: [],
    };
    expect(toPublicAcademyQuestion(question)).toEqual({
      answers: [{ id: "a1", label: "Support" }],
      difficulty: "beginner",
      id: "q1",
      matchTargets: ["Level A"],
      partialCredit: false,
      points: 1,
      prompt: "Match the concept.",
      questionType: "matching",
      tags: [],
    });
  });
});
