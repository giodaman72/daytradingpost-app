import type {
  AcademyCourseDetail,
  AcademyLearningState,
} from "@/types/academy";

export function deriveAcademyAvailability(
  course: AcademyCourseDetail,
  state: AcademyLearningState,
): AcademyLearningState {
  const completedModules = new Set(
    state.moduleProgress
      .filter((item) => item.status === "completed")
      .map((item) => item.moduleId),
  );
  const completedLessons = new Set(
    state.lessonProgress
      .filter((item) => item.status === "completed")
      .map((item) => item.lessonId),
  );
  const availableModules = new Set(
    course.modules
      .filter((module) =>
        module.prerequisiteModuleIds.every((id) => completedModules.has(id)),
      )
      .map((module) => module.id),
  );
  const lessonById = new Map(
    course.modules.flatMap((module) =>
      module.lessons.map((lesson) => [lesson.id, { lesson, module }] as const),
    ),
  );
  return {
    ...state,
    lessonProgress: state.lessonProgress.map((progress) => {
      if (progress.status !== "locked") return progress;
      const item = lessonById.get(progress.lessonId);
      if (
        !item ||
        !availableModules.has(item.module.id) ||
        !item.lesson.prerequisiteLessonIds.every((id) =>
          completedLessons.has(id),
        )
      )
        return progress;
      return { ...progress, status: "available" };
    }),
    moduleProgress: state.moduleProgress.map((progress) =>
      progress.status === "locked" && availableModules.has(progress.moduleId)
        ? { ...progress, status: "available" }
        : progress,
    ),
  };
}
