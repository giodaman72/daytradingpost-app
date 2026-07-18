import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAcademyUser } from "../academyAuthorization";
import { academyConfig } from "../academyConfig";
import { AcademyError } from "../academyErrors";
import { findEnrollment, findPublishedLessonState } from "../academyRepository";
import {
  parseAcademyIdentifier,
  parseVideoPosition,
} from "../academyValidation";
import { calculateVideoProgress } from "./progressCalculator";

async function context(enrollmentIdInput: string, lessonIdInput: string) {
  const access = await requireAcademyUser();
  const enrollmentId = parseAcademyIdentifier(
    enrollmentIdInput,
    "enrollment ID",
  );
  const lessonId = parseAcademyIdentifier(lessonIdInput, "lesson ID");
  const [enrollment, lesson] = await Promise.all([
    findEnrollment(access.userId, enrollmentId),
    findPublishedLessonState(lessonId),
  ]);
  if (!enrollment)
    throw new AcademyError("ACADEMY_NOT_ENROLLED", "Enrollment was not found.");
  if (!lesson || lesson.courseId !== enrollment.courseId)
    throw new AcademyError(
      "ACADEMY_LESSON_NOT_FOUND",
      "Lesson was not found in this enrollment.",
    );
  const { data: progress, error } = await getSupabaseAdmin()
    .from("academy_lesson_progress")
    .select("*")
    .eq("user_id", access.userId)
    .eq("enrollment_id", enrollment.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (error || !progress)
    throw new AcademyError(
      "ACADEMY_LESSON_LOCKED",
      "Lesson progress is unavailable.",
    );
  if (lesson.modulePrerequisiteIds.length) {
    const { data: modulePrerequisites } = await getSupabaseAdmin()
      .from("academy_module_progress")
      .select("module_id,status")
      .eq("user_id", access.userId)
      .eq("enrollment_id", enrollment.id)
      .in("module_id", lesson.modulePrerequisiteIds);
    const completedModules = new Set(
      (modulePrerequisites ?? [])
        .filter((item) => item.status === "completed")
        .map((item) => item.module_id),
    );
    if (lesson.modulePrerequisiteIds.some((id) => !completedModules.has(id)))
      throw new AcademyError(
        "ACADEMY_LESSON_LOCKED",
        "Complete the prerequisite modules first.",
      );
  }
  if (lesson.prerequisiteLessonIds.length) {
    const { data: prerequisites } = await getSupabaseAdmin()
      .from("academy_lesson_progress")
      .select("lesson_id,status")
      .eq("user_id", access.userId)
      .eq("enrollment_id", enrollment.id)
      .in("lesson_id", lesson.prerequisiteLessonIds);
    const complete = new Set(
      (prerequisites ?? [])
        .filter((item) => item.status === "completed")
        .map((item) => item.lesson_id),
    );
    if (lesson.prerequisiteLessonIds.some((id) => !complete.has(id)))
      throw new AcademyError(
        "ACADEMY_PREREQUISITE_NOT_MET",
        "Complete the prerequisite lessons first.",
      );
  }
  return { access, enrollment, lesson, progress };
}

async function recalculateStoredProgress(
  userId: string,
  enrollmentId: string,
  moduleId: string,
) {
  const admin = getSupabaseAdmin();
  const { data: moduleLessons } = await admin
    .from("academy_lesson_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("enrollment_id", enrollmentId)
    .eq("module_id", moduleId)
    .eq("required_for_completion", true);
  const requiredLessons = moduleLessons?.length ?? 0;
  const completedLessons =
    moduleLessons?.filter((item) => item.status === "completed").length ?? 0;
  const modulePercent =
    requiredLessons === 0 ? 100 : (completedLessons / requiredLessons) * 100;
  await admin
    .from("academy_module_progress")
    .update({
      completed_at: modulePercent === 100 ? new Date().toISOString() : null,
      completed_required_lessons_count: completedLessons,
      progress_percent: modulePercent,
      status: modulePercent === 100 ? "completed" : "in_progress",
    })
    .eq("user_id", userId)
    .eq("enrollment_id", enrollmentId)
    .eq("module_id", moduleId);

  const [{ data: requiredLessonRows }, { data: requiredModuleRows }] =
    await Promise.all([
      admin
        .from("academy_lesson_progress")
        .select("status")
        .eq("user_id", userId)
        .eq("enrollment_id", enrollmentId)
        .eq("required_for_completion", true),
      admin
        .from("academy_module_progress")
        .select("status")
        .eq("user_id", userId)
        .eq("enrollment_id", enrollmentId)
        .eq("required_for_completion", true),
    ]);
  const total =
    (requiredLessonRows?.length ?? 0) + (requiredModuleRows?.length ?? 0);
  const completed =
    (requiredLessonRows?.filter((item) => item.status === "completed").length ??
      0) +
    (requiredModuleRows?.filter((item) => item.status === "completed").length ??
      0);
  await admin
    .from("academy_enrollments")
    .update({
      last_accessed_at: new Date().toISOString(),
      progress_percent: total === 0 ? 0 : (completed / total) * 100,
      started_at: new Date().toISOString(),
      status: "in_progress",
    })
    .eq("user_id", userId)
    .eq("id", enrollmentId)
    .neq("status", "completed");
}

export async function startLesson(enrollmentId: string, lessonId: string) {
  const value = await context(enrollmentId, lessonId);
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("academy_lesson_progress")
    .update({
      first_started_at: value.progress.first_started_at ?? now,
      last_accessed_at: now,
      status:
        value.progress.status === "completed" ? "completed" : "in_progress",
    })
    .eq("id", value.progress.id)
    .eq("user_id", value.access.userId)
    .select()
    .single();
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Could not start lesson.",
    );
  return data;
}

export async function updateLessonProgress(input: {
  durationSeconds: number;
  enrollmentId: string;
  lessonId: string;
  positionSeconds: number;
}) {
  const value = await context(input.enrollmentId, input.lessonId);
  if (value.lesson.completionMode !== "video-threshold")
    throw new AcademyError(
      "ACADEMY_VALIDATION_FAILED",
      "This lesson does not accept video checkpoints.",
    );
  const expectedDuration = value.lesson.video?.durationSeconds;
  const duration =
    expectedDuration && expectedDuration > 0
      ? expectedDuration
      : Math.max(1, Math.floor(input.durationSeconds));
  const position = parseVideoPosition(input.positionSeconds, duration);
  const calculated = calculateVideoProgress({
    completionPercent: academyConfig.videoCompletionPercent,
    currentPositionSeconds: position,
    durationSeconds: duration,
    endThresholdSeconds: academyConfig.videoEndThresholdSeconds,
    previousPositionSeconds: Number(value.progress.video_position_seconds ?? 0),
  });
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("academy_lesson_progress")
    .update({
      completed_at: calculated.completed
        ? (value.progress.completed_at ?? now)
        : null,
      completion_method: calculated.completed ? "video-threshold" : null,
      last_accessed_at: now,
      progress_percent: calculated.progressPercent,
      status: calculated.completed ? "completed" : "in_progress",
      video_duration_seconds: duration,
      video_position_seconds: calculated.positionSeconds,
    })
    .eq("id", value.progress.id)
    .eq("user_id", value.access.userId)
    .select()
    .single();
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Could not record lesson progress.",
    );
  await recalculateStoredProgress(
    value.access.userId,
    value.enrollment.id,
    value.lesson.moduleId,
  );
  return data;
}

export async function completeLesson(enrollmentId: string, lessonId: string) {
  const value = await context(enrollmentId, lessonId);
  if (value.progress.status === "completed") return value.progress;
  if (value.lesson.completionMode === "video-threshold")
    throw new AcademyError(
      "ACADEMY_COMPLETION_REQUIREMENTS_NOT_MET",
      "The video watch threshold has not been reached.",
    );
  if (
    ["quiz-passed", "assessment-passed"].includes(value.lesson.completionMode)
  ) {
    const { count } = await getSupabaseAdmin()
      .from("academy_assessment_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", value.access.userId)
      .eq("enrollment_id", value.enrollment.id)
      .eq("assessment_id", value.lesson.assessmentId ?? "")
      .eq("passed", true);
    if (!count)
      throw new AcademyError(
        "ACADEMY_COMPLETION_REQUIREMENTS_NOT_MET",
        "Pass the required assessment before completing this lesson.",
      );
  }
  if (value.lesson.completionMode === "external-confirmation")
    throw new AcademyError(
      "ACADEMY_FORBIDDEN",
      "This lesson requires authorized external confirmation.",
    );
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("academy_lesson_progress")
    .update({
      completed_at: now,
      completion_method: value.lesson.completionMode,
      content_viewed_at:
        value.lesson.completionMode === "content-viewed" ? now : null,
      last_accessed_at: now,
      progress_percent: 100,
      status: "completed",
    })
    .eq("id", value.progress.id)
    .eq("user_id", value.access.userId)
    .select()
    .single();
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Could not complete lesson.",
    );
  await recalculateStoredProgress(
    value.access.userId,
    value.enrollment.id,
    value.lesson.moduleId,
  );
  return data;
}
