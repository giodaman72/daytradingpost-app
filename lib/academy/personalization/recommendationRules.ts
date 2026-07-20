import type {
  AcademyCourse,
  AcademyLearningRecommendation,
  AcademyRecommendationReason,
} from "@/types/academy";

export const CONTINUE_LEARNING_PRIORITY = {
  activeAssessment: 1,
  currentRequiredLesson: 2,
  recentActiveCourse: 3,
  nextLearningPathCourse: 4,
  recommendedPublicCourse: 5,
} as const;

export function rankContinueLearning(
  candidates: AcademyLearningRecommendation[],
) {
  return candidates.toSorted(
    (left, right) =>
      left.priority - right.priority ||
      left.course.title.localeCompare(right.course.title),
  );
}

export function recommendationReasonText(reason: AcademyRecommendationReason) {
  const copy: Record<AcademyRecommendationReason, string> = {
    "active-assessment": "Resume an active timed assessment.",
    "current-required-lesson": "Continue the current required lesson.",
    "continue-course": "Continue your most recently accessed active course.",
    "next-in-learning-path": "Next in your active learning path.",
    "prerequisite-completed": "A prerequisite for this course is complete.",
    "reinforces-recent-lesson":
      "Reinforces a topic from your recently accessed course.",
    "selected-interest": "Matches an Academy interest you selected.",
    "beginner-continuation":
      "A published beginner continuation with no unmet prerequisites.",
  };
  return copy[reason];
}

export function recommendCoursesByRules(input: {
  completedCourseIds: ReadonlySet<string>;
  courses: AcademyCourse[];
  enrolledCourseIds: ReadonlySet<string>;
  interests: readonly string[];
  recentCourse?: AcademyCourse | null;
  limit?: number;
}) {
  const interests = new Set(input.interests.map((item) => item.toLowerCase()));
  return input.courses
    .filter(
      (course) =>
        !input.completedCourseIds.has(course.id) &&
        !input.enrolledCourseIds.has(course.id) &&
        course.prerequisiteCourseIds.every((id) =>
          input.completedCourseIds.has(id),
        ),
    )
    .map((course) => {
      const selectedInterest = course.tags.some((tag) =>
        interests.has(tag.toLowerCase()),
      );
      const reinforcesRecent = Boolean(
        input.recentCourse &&
        (course.category?.id === input.recentCourse.category?.id ||
          course.tags.some((tag) => input.recentCourse?.tags.includes(tag))),
      );
      const reason: AcademyRecommendationReason = selectedInterest
        ? "selected-interest"
        : reinforcesRecent
          ? "reinforces-recent-lesson"
          : course.prerequisiteCourseIds.length
            ? "prerequisite-completed"
            : "beginner-continuation";
      return { course, reason, reasonText: recommendationReasonText(reason) };
    })
    .toSorted((left, right) => {
      const weight: Record<AcademyRecommendationReason, number> = {
        "selected-interest": 0,
        "reinforces-recent-lesson": 1,
        "prerequisite-completed": 2,
        "beginner-continuation": 3,
        "active-assessment": 4,
        "current-required-lesson": 4,
        "continue-course": 4,
        "next-in-learning-path": 4,
      };
      return (
        weight[left.reason] - weight[right.reason] ||
        left.course.title.localeCompare(right.course.title)
      );
    })
    .slice(0, input.limit ?? 6);
}
