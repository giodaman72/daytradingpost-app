import type { AcademyQuestion, AcademyScoringResult } from "@/types/academy";
import { AcademyError } from "../academyErrors";

const SCALE = 10_000;
const scaled = (value: number) => Math.round(value * SCALE);
const unscaled = (value: number) => value / SCALE;
const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value) => b.includes(value));
const stringArray = (value: unknown) =>
  Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : null;

function scoreQuestion(question: AcademyQuestion, response: unknown) {
  if (question.questionType === "short-answer")
    return { awarded: 0, correct: false };

  if (
    question.questionType === "single-choice" ||
    question.questionType === "true-false"
  ) {
    const correct = response === question.correctAnswer;
    return { awarded: correct ? question.points : 0, correct };
  }

  if (
    question.questionType === "multiple-choice" ||
    question.questionType === "ordering"
  ) {
    const submitted = stringArray(response);
    const answer = stringArray(question.correctAnswer);
    if (!submitted || !answer)
      throw new AcademyError(
        "ACADEMY_INVALID_RESPONSE",
        "An assessment response is malformed.",
      );
    const correct =
      question.questionType === "ordering"
        ? submitted.length === answer.length &&
          submitted.every((value, index) => value === answer[index])
        : sameSet(submitted, answer);
    if (correct) return { awarded: question.points, correct: true };
    if (!question.partialCredit || answer.length === 0)
      return { awarded: 0, correct: false };
    const selectedCorrectly = submitted.filter((value) =>
      answer.includes(value),
    ).length;
    const incorrectSelections = submitted.filter(
      (value) => !answer.includes(value),
    ).length;
    const ratio = Math.max(
      0,
      (selectedCorrectly - incorrectSelections) / answer.length,
    );
    return {
      awarded: unscaled(scaled(question.points * ratio)),
      correct: false,
    };
  }

  if (question.questionType === "numeric") {
    if (
      typeof response !== "number" ||
      typeof question.correctAnswer !== "number"
    )
      throw new AcademyError(
        "ACADEMY_INVALID_RESPONSE",
        "A numeric response is required.",
      );
    const tolerance = question.answers[0]?.numericTolerance ?? 0;
    const correct = Math.abs(response - question.correctAnswer) <= tolerance;
    return { awarded: correct ? question.points : 0, correct };
  }

  const submitted =
    response && typeof response === "object" && !Array.isArray(response)
      ? (response as Record<string, unknown>)
      : null;
  const answer =
    question.correctAnswer &&
    typeof question.correctAnswer === "object" &&
    !Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : null;
  if (!submitted || !answer)
    throw new AcademyError(
      "ACADEMY_INVALID_RESPONSE",
      "A matching response is required.",
    );
  const keys = Object.keys(answer);
  const correctCount = keys.filter(
    (key) => submitted[key] === answer[key],
  ).length;
  const correct = correctCount === keys.length;
  const ratio =
    question.partialCredit && keys.length > 0 ? correctCount / keys.length : 0;
  return {
    awarded: correct
      ? question.points
      : unscaled(scaled(question.points * ratio)),
    correct,
  };
}

export function scoreAssessment(
  questions: AcademyQuestion[],
  responses: Record<string, unknown>,
  passingScore: number,
): AcademyScoringResult {
  const knownIds = new Set(questions.map((question) => question.id));
  if (Object.keys(responses).some((id) => !knownIds.has(id)))
    throw new AcademyError(
      "ACADEMY_INVALID_RESPONSE",
      "A response does not belong to this attempt.",
    );
  let awardedScaled = 0;
  let maximumScaled = 0;
  const graded = questions.map((question) => {
    const result =
      responses[question.id] === undefined
        ? { awarded: 0, correct: false }
        : scoreQuestion(question, responses[question.id]);
    awardedScaled += scaled(result.awarded);
    maximumScaled += scaled(question.points);
    return {
      awardedPoints: result.awarded,
      correct: result.correct,
      maximumPoints: question.points,
      questionId: question.id,
    };
  });
  const awardedPoints = unscaled(awardedScaled);
  const maximumPoints = unscaled(maximumScaled);
  const scorePercent =
    maximumScaled === 0
      ? 0
      : Math.round((awardedScaled / maximumScaled) * 10_000) / 100;
  return {
    awardedPoints,
    maximumPoints,
    passed: scorePercent >= passingScore,
    responses: graded,
    scorePercent,
  };
}
