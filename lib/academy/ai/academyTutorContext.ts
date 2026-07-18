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
  const {
    assessment: _assessment,
    correctAnswer: _correctAnswer,
    questions: _questions,
    ...safe
  } = lesson;
  return {
    ...safe,
    citation: buildAcademyCitation(
      String(lesson.title ?? "Academy lesson"),
      String(lesson.slug ?? ""),
    ),
  };
}

export function buildAcademyCitation(title: string, slug: string) {
  return {
    title,
    url: `/academy/lessons/${encodeURIComponent(slug)}`,
  };
}

export const canUseAcademyTutor = (
  aiTutorEnabled: boolean,
  authorized: boolean,
) => aiTutorEnabled && authorized;
