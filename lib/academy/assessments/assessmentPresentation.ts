import type { AcademyPublicQuestion } from "@/types/academy";

export function isAssessmentResponseAnswered(
  question: AcademyPublicQuestion,
  value: unknown,
) {
  if (question.questionType === "multiple-choice")
    return Array.isArray(value) && value.length > 0;
  if (question.questionType === "ordering")
    return Array.isArray(value) && value.length === question.answers.length;
  if (question.questionType === "matching")
    return (
      Boolean(value) &&
      typeof value === "object" &&
      question.answers.every(
        (answer) =>
          typeof (value as Record<string, unknown>)[answer.id] === "string" &&
          Boolean((value as Record<string, string>)[answer.id]),
      )
    );
  return value !== undefined && value !== null && value !== "";
}

export function countUnansweredAssessmentQuestions(
  questions: AcademyPublicQuestion[],
  responses: Record<string, unknown>,
) {
  return questions.filter(
    (question) =>
      !isAssessmentResponseAnswered(question, responses[question.id]),
  ).length;
}

export function normalizeAssessmentSubmission(
  questions: AcademyPublicQuestion[],
  responses: Record<string, unknown>,
) {
  const normalized: Record<string, unknown> = {};
  for (const question of questions) {
    const value = responses[question.id];
    if (!isAssessmentResponseAnswered(question, value)) continue;
    const answerIds = new Set(question.answers.map((answer) => answer.id));
    if (question.questionType === "numeric") {
      const numeric = typeof value === "number" ? value : Number(value);
      if (Number.isFinite(numeric)) normalized[question.id] = numeric;
      continue;
    }
    if (
      question.questionType === "multiple-choice" ||
      question.questionType === "ordering"
    ) {
      normalized[question.id] = [
        ...new Set(
          (value as unknown[]).filter(
            (item): item is string =>
              typeof item === "string" && answerIds.has(item),
          ),
        ),
      ];
      continue;
    }
    if (question.questionType === "matching") {
      const matches = value as Record<string, unknown>;
      normalized[question.id] = Object.fromEntries(
        question.answers
          .map((answer) => [answer.id, matches[answer.id]])
          .filter(
            (entry): entry is [string, string] =>
              typeof entry[1] === "string" &&
              Boolean(entry[1]) &&
              Boolean(question.matchTargets?.includes(entry[1])),
          ),
      );
      continue;
    }
    if (
      typeof value === "string" &&
      (question.questionType === "single-choice" ||
        question.questionType === "true-false")
    ) {
      if (answerIds.has(value)) normalized[question.id] = value;
      continue;
    }
    if (typeof value === "string")
      normalized[question.id] = value.trim().slice(0, 5_000);
  }
  return normalized;
}
