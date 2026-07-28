import { describe, expect, it } from "vitest";
import type { AcademyQuestion } from "@/types/academy";
import { AcademyError } from "../academyErrors";
import { scoreAssessment } from "./assessmentScoring";

const question = (
  patch: Partial<AcademyQuestion> &
    Pick<AcademyQuestion, "id" | "questionType">,
): AcademyQuestion => ({
  answers: [],
  correctAnswer: "a",
  difficulty: "beginner",
  explanation: null,
  partialCredit: false,
  points: 1,
  prompt: "Question",
  tags: [],
  ...patch,
});

describe("Academy assessment scoring", () => {
  it("scores single choice", () => {
    const result = scoreAssessment(
      [question({ id: "q1", questionType: "single-choice" })],
      { q1: "a" },
      70,
    );
    expect(result).toMatchObject({
      awardedPoints: 1,
      passed: true,
      scorePercent: 100,
    });
  });

  it("scores true/false", () => {
    expect(
      scoreAssessment(
        [
          question({
            correctAnswer: "true",
            id: "q1",
            questionType: "true-false",
          }),
        ],
        { q1: "false" },
        70,
      ).scorePercent,
    ).toBe(0);
  });

  it("scores multiple choice independent of submitted order", () => {
    expect(
      scoreAssessment(
        [
          question({
            correctAnswer: ["a", "b"],
            id: "q1",
            questionType: "multiple-choice",
          }),
        ],
        { q1: ["b", "a"] },
        70,
      ).passed,
    ).toBe(true);
  });

  it("supports explicit partial credit without rewarding guessing", () => {
    expect(
      scoreAssessment(
        [
          question({
            correctAnswer: ["a", "b"],
            id: "q1",
            partialCredit: true,
            points: 2,
            questionType: "multiple-choice",
          }),
        ],
        { q1: ["a"] },
        0,
      ).awardedPoints,
    ).toBe(1);
  });

  it("requires exact ordering", () => {
    expect(
      scoreAssessment(
        [
          question({
            correctAnswer: ["a", "b"],
            id: "q1",
            questionType: "ordering",
          }),
        ],
        { q1: ["b", "a"] },
        70,
      ).scorePercent,
    ).toBe(0);
  });

  it("scores numeric answers within tolerance", () => {
    expect(
      scoreAssessment(
        [
          question({
            answers: [{ id: "n", label: "", numericTolerance: 0.1 }],
            correctAnswer: 2.5,
            id: "q1",
            questionType: "numeric",
          }),
        ],
        { q1: 2.55 },
        70,
      ).passed,
    ).toBe(true);
  });

  it("scores matching answers", () => {
    expect(
      scoreAssessment(
        [
          question({
            correctAnswer: { a: "1", b: "2" },
            id: "q1",
            questionType: "matching",
          }),
        ],
        { q1: { a: "1", b: "2" } },
        70,
      ).passed,
    ).toBe(true);
  });

  it("leaves short answers ungraded", () => {
    expect(
      scoreAssessment(
        [question({ id: "q1", questionType: "short-answer" })],
        { q1: "practice answer" },
        1,
      ).passed,
    ).toBe(false);
  });

  it("handles unanswered questions", () => {
    expect(
      scoreAssessment(
        [question({ id: "q1", questionType: "single-choice" })],
        {},
        70,
      ).scorePercent,
    ).toBe(0);
  });

  it("rejects responses not included in the attempt", () => {
    expect(() =>
      scoreAssessment(
        [question({ id: "q1", questionType: "single-choice" })],
        { forged: "a" },
        70,
      ),
    ).toThrow(AcademyError);
  });

  it("uses decimal-safe totals", () => {
    const result = scoreAssessment(
      [
        question({
          id: "q1",
          points: 0.1,
          questionType: "single-choice",
        }),
        question({
          id: "q2",
          points: 0.2,
          questionType: "single-choice",
        }),
      ],
      { q1: "a", q2: "a" },
      100,
    );
    expect(result.awardedPoints).toBe(0.3);
    expect(result.scorePercent).toBe(100);
  });
});
