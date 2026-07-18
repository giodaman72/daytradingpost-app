import "server-only";

import type { AcademyCourse, AcademyDifficulty } from "@/types/academy";
import { listPublishedCourses } from "./academyRepository";

export async function searchAcademyCourses(input: {
  difficulty?: AcademyDifficulty;
  limit?: number;
  premium?: boolean;
  query?: string;
}) {
  const courses = await listPublishedCourses(
    Math.min(input.limit ?? 20, 100),
    0,
  );
  const query = input.query?.trim().toLowerCase();
  return courses.filter((course) => {
    if (input.difficulty && course.difficulty !== input.difficulty)
      return false;
    if (
      typeof input.premium === "boolean" &&
      (course.accessLevel === "premium") !== input.premium
    )
      return false;
    return (
      !query ||
      [course.title, course.excerpt, ...course.tags]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  });
}

export type AcademyRecommendation = {
  course: AcademyCourse;
  reason:
    | "next-in-learning-path"
    | "prerequisite-completed"
    | "related-to-current-course"
    | "beginner-continuation";
};
