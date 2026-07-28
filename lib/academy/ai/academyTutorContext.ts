import "server-only";

import { findLessonForTutor } from "../academyRepository";
import { AcademyError } from "../academyErrors";
import { parseAcademyIdentifier } from "../academyValidation";

export async function getAcademyTutorContext(input: {
  hasLessonAccess: boolean;
  hasPremiumAccess: boolean;
  lessonId: string;
}) {
  if (!input.hasLessonAccess)
    throw new AcademyError(
      "ACADEMY_FORBIDDEN",
      "This lesson is not available for Tutor context.",
    );
  const lesson = await findLessonForTutor(
    parseAcademyIdentifier(input.lessonId, "lesson ID"),
  );
  if (!lesson)
    throw new AcademyError(
      "ACADEMY_LESSON_NOT_FOUND",
      "This lesson is not available.",
    );
  if (lesson.accessLevel === "premium" && !input.hasPremiumAccess)
    throw new AcademyError(
      "ACADEMY_PREMIUM_REQUIRED",
      "Premium membership is required.",
    );
  return sanitizeAcademyTutorContext(lesson);
}

export function sanitizeAcademyTutorContext(lesson: Record<string, unknown>) {
  const safe = removeProtectedAcademyFields(lesson) as Record<string, unknown>;
  return {
    ...safe,
    citation: buildAcademyCitation(
      String(lesson.title ?? "Academy lesson"),
      String(lesson.courseSlug ?? ""),
      String(lesson.slug ?? ""),
    ),
  };
}

const PROTECTED_KEYS = new Set([
  "answerKey",
  "assessment",
  "correctAnswer",
  "correctOptionIds",
  "explanation",
  "numericAnswer",
  "numericTolerance",
  "questions",
  "responses",
]);

export function removeProtectedAcademyFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removeProtectedAcademyFields);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !PROTECTED_KEYS.has(key))
      .map(([key, child]) => [key, removeProtectedAcademyFields(child)]),
  );
}

export function buildAcademyCitation(
  title: string,
  courseSlug: string,
  lessonSlug: string,
) {
  return {
    title,
    url: `/academy/courses/${encodeURIComponent(courseSlug)}/learn/${encodeURIComponent(lessonSlug)}`,
  };
}

export const canUseAcademyTutor = (
  aiTutorEnabled: boolean,
  authorized: boolean,
) => aiTutorEnabled && authorized;
