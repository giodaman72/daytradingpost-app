import type { AcademyCourse } from "@/types/academy";
import type { AcademyRecommendation } from "./academySearch";

export function recommendAcademyCourses(input: {
  completedCourseIds: ReadonlySet<string>;
  courses: AcademyCourse[];
  currentCourse?: AcademyCourse | null;
  limit?: number;
}): AcademyRecommendation[] {
  return input.courses
    .filter(
      (course) =>
        !input.completedCourseIds.has(course.id) &&
        course.prerequisiteCourseIds.every((id) =>
          input.completedCourseIds.has(id),
        ),
    )
    .map((course) => ({
      course,
      reason:
        input.currentCourse &&
        course.tags.some((tag) => input.currentCourse?.tags.includes(tag))
          ? ("related-to-current-course" as const)
          : course.prerequisiteCourseIds.length > 0
            ? ("prerequisite-completed" as const)
            : ("beginner-continuation" as const),
    }))
    .slice(0, input.limit ?? 3);
}
