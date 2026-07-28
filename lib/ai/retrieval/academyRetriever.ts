import "server-only";

import { listPublishedCourses } from "@/lib/academy/academyRepository";
import type { RetrievalDocument } from "@/types/ai-context";

export async function retrieveAcademyContent(
  hasPremiumAccess: boolean,
): Promise<RetrievalDocument[]> {
  const courses = await listPublishedCourses(12, 0);
  return courses
    .filter(
      (course) =>
        course.accessLevel === "free" ||
        (course.accessLevel === "premium" && hasPremiumAccess),
    )
    .map((course) => ({
      sourceType: "academy" as const,
      sourceId: course.id,
      title: course.title,
      content: [
        course.excerpt,
        `Difficulty: ${course.difficulty}.`,
        `Learning objectives: ${course.learningObjectives.join("; ")}.`,
      ].join("\n"),
      url: `/academy/${course.slug}`,
      timestamp: course.updatedAt,
      premium: course.accessLevel === "premium",
      delayed: false,
      fixture: false,
      relevance: 60,
    }));
}
