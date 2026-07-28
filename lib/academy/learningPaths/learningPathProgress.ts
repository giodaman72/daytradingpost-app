import type {
  AcademyLearningPath,
  AcademyLearningPathEnrollment,
  AcademyLearningPathProgress,
} from "@/types/academy";

type CourseEnrollmentState = {
  courseId: string;
  status: string;
};

export function calculateLearningPathProgress(input: {
  completedCourseIds: ReadonlySet<string>;
  courseEnrollments: CourseEnrollmentState[];
  enrollment: AcademyLearningPathEnrollment | null;
  hasPremiumAccess: boolean;
  path: AcademyLearningPath;
}): AcademyLearningPathProgress {
  const completed = input.completedCourseIds;
  const historicalCompletion =
    input.enrollment?.status === "completed" &&
    input.enrollment.learningPathVersion < input.path.version;
  const enrollmentByCourse = new Map(
    input.courseEnrollments.map((item) => [item.courseId, item]),
  );
  const required = input.path.courses.filter((item) => item.required);
  const completedRequiredCourses = required.filter((item) =>
    completed.has(item.course.id),
  ).length;
  const completedOptionalCourses = input.path.courses.filter(
    (item) => !item.required && completed.has(item.course.id),
  ).length;
  const progressPercent = required.length
    ? Math.round((completedRequiredCourses / required.length) * 100)
    : 0;
  let priorRequiredCoursesComplete = true;

  const nodes = input.path.courses.map((item) => {
    const { course } = item;
    const enrollment = enrollmentByCourse.get(course.id);
    const prerequisitesMet = course.prerequisiteCourseIds.every((id) =>
      completed.has(id),
    );
    let state: AcademyLearningPathProgress["nodes"][number]["state"];
    let lockReason: string | null = null;

    if (completed.has(course.id)) {
      state = "completed";
    } else if (historicalCompletion) {
      state = "optional";
      lockReason = "Added after your completed learning-path version.";
    } else if (
      input.enrollment?.status === "expired" ||
      input.enrollment?.status === "revoked"
    ) {
      state = "access-expired";
      lockReason = "Your learning-path access is no longer active.";
    } else if (course.status === "archived") {
      state = "archived";
      lockReason = "This course has been archived by the Academy team.";
    } else if (course.status !== "published" || !course.slug) {
      state = "unavailable";
      lockReason = "This course is not currently available.";
    } else if (
      (input.path.accessLevel === "premium" ||
        course.accessLevel === "premium") &&
      !input.hasPremiumAccess
    ) {
      state = "premium";
      lockReason = "Premium membership is required for this course.";
    } else if (!priorRequiredCoursesComplete || !prerequisitesMet) {
      state = "locked";
      lockReason = !priorRequiredCoursesComplete
        ? "Complete the earlier required course first."
        : "Complete this course’s prerequisites first.";
    } else if (
      input.enrollment &&
      (input.enrollment.currentCourseId === course.id ||
        enrollment?.status === "in_progress")
    ) {
      state = "current";
    } else {
      state = item.required ? "available" : "optional";
    }

    if (item.required && !completed.has(course.id)) {
      priorRequiredCoursesComplete = false;
    }
    return {
      course,
      lockReason,
      required:
        historicalCompletion && !completed.has(course.id)
          ? false
          : item.required,
      state,
    };
  });

  const nextNode = historicalCompletion
    ? undefined
    : (nodes.find((node) => node.state === "current") ??
      nodes.find((node) => node.required && node.state === "available") ??
      nodes.find((node) => node.state === "optional"));

  return {
    completedOptionalCourses,
    completedRequiredCourses: historicalCompletion
      ? required.length
      : completedRequiredCourses,
    historicalCompletion,
    nextCourse: nextNode?.course ?? null,
    nodes,
    progressPercent: historicalCompletion ? 100 : progressPercent,
    remainingDurationMinutes: historicalCompletion
      ? 0
      : input.path.courses
          .filter((item) => !completed.has(item.course.id))
          .reduce((total, item) => total + item.course.durationMinutes, 0),
    requiredCourses: required.length,
  };
}

export function getLearningPathMilestones(progressPercent: number) {
  return [25, 50, 75, 100].map((threshold) => ({
    achieved: progressPercent >= threshold,
    label:
      threshold === 100
        ? "Path completed"
        : `${threshold}% of required courses completed`,
    threshold,
  }));
}
