import { describe, expect, it } from "vitest";
import type { AcademyLearningPath } from "@/types/academy";
import { recommendLearningPaths } from "./learningPathRecommendations";

const basePath = {
  accessLevel: "free",
  category: null,
  courses: [],
  coverImage: null,
  description: [],
  difficulty: "beginner",
  durationMinutes: 60,
  featured: false,
  prerequisitePathIds: [],
  publishedAt: "2026-01-01T00:00:00Z",
  requiredCourseIds: [],
  status: "published",
  targetAudience: [],
  version: 1,
} satisfies Omit<AcademyLearningPath, "id" | "slug" | "title">;

describe("learning path recommendations", () => {
  it("returns an explainable, non-sensitive reason", () => {
    const recommendations = recommendLearningPaths({
      completedPathIds: new Set(),
      currentDifficulty: "beginner",
      enrolledPathIds: new Set(),
      paths: [
        {
          ...basePath,
          id: "path-1",
          slug: "path-1",
          title: "Foundations",
        },
      ],
    });
    expect(recommendations[0].reason).toMatch(
      /current beginner learning level/,
    );
    expect(recommendations[0].reason).not.toMatch(
      /income|age|gender|ethnicity|financial suitability/i,
    );
  });

  it("requires completed prerequisite paths", () => {
    const path = {
      ...basePath,
      id: "path-2",
      prerequisitePathIds: ["path-1"],
      slug: "path-2",
      title: "Continuation",
    };
    expect(
      recommendLearningPaths({
        completedPathIds: new Set(),
        enrolledPathIds: new Set(),
        paths: [path],
      }),
    ).toHaveLength(0);
    expect(
      recommendLearningPaths({
        completedPathIds: new Set(["path-1"]),
        enrolledPathIds: new Set(),
        paths: [path],
      })[0].reason,
    ).toMatch(/completed its prerequisite/);
  });
});
