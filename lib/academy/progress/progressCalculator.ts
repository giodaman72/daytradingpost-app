import type {
  AcademyCompletionResult,
  AcademyLessonProgress,
  AcademyModuleProgress,
  AcademyProgressSummary,
} from "@/types/academy";

const boundedPercent = (value: number) =>
  Math.min(100, Math.max(0, Math.round(value * 100) / 100));

export function calculateModuleProgress(
  requiredLessonIds: string[],
  lessonProgress: Pick<AcademyLessonProgress, "lessonId" | "status">[],
) {
  const completed = new Set(
    lessonProgress
      .filter((item) => item.status === "completed")
      .map((item) => item.lessonId),
  );
  const completedRequiredLessonsCount = requiredLessonIds.filter((id) =>
    completed.has(id),
  ).length;
  const progressPercent =
    requiredLessonIds.length === 0
      ? 100
      : boundedPercent(
          (completedRequiredLessonsCount / requiredLessonIds.length) * 100,
        );
  return {
    completed: progressPercent === 100,
    completedRequiredLessonsCount,
    progressPercent,
    requiredLessonsCount: requiredLessonIds.length,
  };
}

export function calculateCourseProgress(
  requiredModuleIds: string[],
  moduleProgress: Pick<AcademyModuleProgress, "moduleId" | "status">[],
  requiredLessonIds: string[],
  lessonProgress: Pick<AcademyLessonProgress, "lessonId" | "status">[],
): AcademyProgressSummary {
  const completedModules = new Set(
    moduleProgress
      .filter((item) => item.status === "completed")
      .map((item) => item.moduleId),
  );
  const completedLessons = new Set(
    lessonProgress
      .filter((item) => item.status === "completed")
      .map((item) => item.lessonId),
  );
  const completedRequiredModules = requiredModuleIds.filter((id) =>
    completedModules.has(id),
  ).length;
  const completedRequiredLessons = requiredLessonIds.filter((id) =>
    completedLessons.has(id),
  ).length;
  const total = requiredModuleIds.length + requiredLessonIds.length;
  const completed = completedRequiredModules + completedRequiredLessons;
  const coursePercent =
    total === 0 ? 0 : boundedPercent((completed / total) * 100);
  return {
    completedLessons: completedRequiredLessons,
    completedModules: completedRequiredModules,
    courseCompleted: total > 0 && completed === total,
    coursePercent,
    totalRequiredLessons: requiredLessonIds.length,
    totalRequiredModules: requiredModuleIds.length,
  };
}

export function evaluateCourseCompletion(input: {
  finalAssessmentPassed: boolean | null;
  minimumAssessmentRequired: boolean;
  requiredLessonIds: string[];
  requiredModuleIds: string[];
  lessonProgress: Pick<AcademyLessonProgress, "lessonId" | "status">[];
  moduleProgress: Pick<AcademyModuleProgress, "moduleId" | "status">[];
  previouslyCompletedAt?: string | null;
  now?: string;
}): AcademyCompletionResult {
  if (input.previouslyCompletedAt)
    return {
      completed: true,
      completedAt: input.previouslyCompletedAt,
      progressPercent: 100,
      unmetRequirements: [],
    };
  const summary = calculateCourseProgress(
    input.requiredModuleIds,
    input.moduleProgress,
    input.requiredLessonIds,
    input.lessonProgress,
  );
  const unmetRequirements: string[] = [];
  if (summary.completedLessons !== summary.totalRequiredLessons)
    unmetRequirements.push("required-lessons");
  if (summary.completedModules !== summary.totalRequiredModules)
    unmetRequirements.push("required-modules");
  if (input.minimumAssessmentRequired && input.finalAssessmentPassed !== true)
    unmetRequirements.push("final-assessment");
  return {
    completed: unmetRequirements.length === 0,
    completedAt:
      unmetRequirements.length === 0
        ? (input.now ?? new Date().toISOString())
        : null,
    progressPercent:
      unmetRequirements.length === 0 ? 100 : summary.coursePercent,
    unmetRequirements,
  };
}

export function calculateVideoProgress(input: {
  currentPositionSeconds: number;
  durationSeconds: number;
  previousPositionSeconds: number;
  completionPercent: number;
  endThresholdSeconds: number;
}) {
  const duration = Math.max(1, Math.floor(input.durationSeconds));
  const previous = Math.min(
    duration,
    Math.max(0, input.previousPositionSeconds),
  );
  const current = Math.min(duration, Math.max(0, input.currentPositionSeconds));
  const positionSeconds = Math.max(previous, current);
  const percent = boundedPercent((positionSeconds / duration) * 100);
  return {
    completed:
      percent >= input.completionPercent ||
      duration - positionSeconds <= input.endThresholdSeconds,
    positionSeconds,
    progressPercent: percent,
  };
}
