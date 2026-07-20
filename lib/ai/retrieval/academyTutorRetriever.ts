import "server-only";

import { getAssessmentAttemptForLearner } from "@/lib/academy/assessments/assessmentService";
import {
  getAcademyLearningState,
  getAcademyLessonView,
} from "@/lib/academy/academyService";
import { removeProtectedAcademyFields } from "@/lib/academy/ai/academyTutorContext";
import { isFinalAssessmentStatus } from "@/lib/academy/ai/academyTutorPolicy";
import { AcademyError } from "@/lib/academy/academyErrors";
import type { AssistantRequest } from "@/types/ai-assistant";
import type { RetrievalDocument } from "@/types/ai-context";
import { AssistantError } from "../assistantErrors";

function plainText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (Array.isArray(value))
    return value.map(plainText).filter(Boolean).join(" ");
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record._type === "image") return "";
    return plainText(record.children ?? record.text ?? record.body ?? "");
  }
  return "";
}

function courseDocument(
  course: Awaited<ReturnType<typeof getAcademyLearningState>>["course"],
): RetrievalDocument {
  return {
    sourceType: "academy",
    sourceId: course.id,
    title: course.title,
    content: [
      course.excerpt,
      `Difficulty: ${course.difficulty}.`,
      `Learning objectives: ${course.learningObjectives.join("; ") || "not supplied"}.`,
    ].join("\n"),
    url: `/academy/courses/${course.slug}`,
    timestamp: course.updatedAt,
    premium: course.accessLevel === "premium",
    delayed: false,
    fixture: false,
    relevance: 90,
  };
}

export async function retrieveAcademyTutorContent(
  request: AssistantRequest,
): Promise<RetrievalDocument[]> {
  const documents: RetrievalDocument[] = [];
  let authorizedCourseId: string | null = null;
  if (request.academyCourseSlug && request.academyLessonSlug) {
    const view = await academyCall(() =>
      getAcademyLessonView(
        request.academyCourseSlug as string,
        request.academyLessonSlug as string,
      ),
    );
    authorizedCourseId = view.course.id;
    if (!view.currentLesson.aiTutorEnabled)
      throw new AssistantError(
        "FORBIDDEN",
        "AI Tutor is not enabled for this lesson.",
        403,
      );
    const safeLesson = removeProtectedAcademyFields(
      view.currentLesson,
    ) as Record<string, unknown>;
    documents.push(
      {
        ...courseDocument(view.course),
        relevance: 95,
      },
      {
        sourceType: "academy",
        sourceId: view.currentLesson.id,
        title: `${view.course.title} — ${view.currentLesson.title}`,
        content: [
          `Course: ${view.course.title}.`,
          `Lesson: ${view.currentLesson.title}.`,
          view.currentLesson.summary,
          `Learning objectives: ${view.currentLesson.learningObjectives.join("; ") || "not supplied"}.`,
          plainText(safeLesson.body),
          view.currentLesson.resources
            .map(
              (resource) =>
                `Published resource: ${resource.title}. ${resource.description ?? ""}`,
            )
            .join("\n"),
        ]
          .filter(Boolean)
          .join("\n"),
        url: `/academy/courses/${view.course.slug}/learn/${view.currentLesson.slug}`,
        timestamp: view.course.updatedAt,
        premium:
          view.course.accessLevel === "premium" ||
          view.currentLesson.accessLevel === "premium",
        delayed: false,
        fixture: false,
        relevance: 100,
      },
    );
  } else if (request.academyCourseSlug) {
    const state = await academyCall(() =>
      getAcademyLearningState(request.academyCourseSlug as string),
    );
    authorizedCourseId = state.course.id;
    documents.push(courseDocument(state.course));
  }

  if (request.academyAttemptId) {
    const view = await academyCall(() =>
      getAssessmentAttemptForLearner(request.academyAttemptId as string),
    );
    if (!authorizedCourseId || view.assessment.courseId !== authorizedCourseId)
      throw new AssistantError(
        "FORBIDDEN",
        "Assessment feedback does not belong to this course.",
        403,
      );
    if (!isFinalAssessmentStatus(view.attempt.status))
      throw new AssistantError(
        "FORBIDDEN",
        "AI Tutor cannot help with an active assessment.",
        403,
      );
    const feedback = view.responses
      .filter((response) => response.feedback || response.correct !== null)
      .map(
        (response) =>
          `Question ${response.questionId}: ${response.correct === null ? "result withheld" : response.correct ? "correct" : "incorrect"}. ${response.feedback ?? "No published feedback is available."}`,
      )
      .join("\n");
    if (feedback)
      documents.push({
        sourceType: "academy",
        sourceId: `attempt-feedback:${view.attempt.id}`,
        title: `${view.assessment.title} — permitted feedback`,
        content: feedback,
        url: `/academy/assessments/attempts/${view.attempt.id}/result`,
        timestamp: view.attempt.submittedAt,
        premium: false,
        delayed: false,
        fixture: false,
        relevance: 100,
      });
  }
  return documents;
}

async function academyCall<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!(error instanceof AcademyError)) throw error;
    if (
      [
        "ACADEMY_COURSE_NOT_FOUND",
        "ACADEMY_LESSON_NOT_FOUND",
        "ACADEMY_ASSESSMENT_NOT_AVAILABLE",
      ].includes(error.code)
    )
      throw new AssistantError(
        "NO_CONTEXT",
        "No authorized Academy source was found.",
        422,
      );
    if (error.code === "ACADEMY_PROVIDER_UNAVAILABLE")
      throw new AssistantError(
        "PROVIDER_UNAVAILABLE",
        "Academy sources are temporarily unavailable.",
        503,
        true,
      );
    throw new AssistantError(
      "FORBIDDEN",
      "This Academy source is not available to your account.",
      403,
    );
  }
}
