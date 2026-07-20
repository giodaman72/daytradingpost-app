import { describe, expect, it } from "vitest";
import type {
  AcademyCourse,
  AcademyLearningRecommendation,
} from "@/types/academy";
import {
  CONTINUE_LEARNING_PRIORITY,
  rankContinueLearning,
  recommendationReasonText,
  recommendCoursesByRules,
} from "./recommendationRules";

const course = (id: string, tags: string[] = []): AcademyCourse =>
  ({
    accessLevel: "free",
    category: { id: "risk", title: "Risk" },
    difficulty: "beginner",
    excerpt: `${id} excerpt`,
    id,
    prerequisiteCourseIds: [],
    slug: id,
    tags,
    title: id,
  }) as unknown as AcademyCourse;

describe("Academy recommendation rules", () => {
  it("uses the exact deterministic continue-learning priority", () => {
    expect(CONTINUE_LEARNING_PRIORITY).toEqual({
      activeAssessment: 1,
      currentRequiredLesson: 2,
      recentActiveCourse: 3,
      nextLearningPathCourse: 4,
      recommendedPublicCourse: 5,
    });
    const candidates = [5, 2, 1, 4, 3].map(
      (priority) =>
        ({
          course: course(String(priority)),
          priority,
        }) as AcademyLearningRecommendation,
    );
    expect(
      rankContinueLearning(candidates).map((item) => item.priority),
    ).toEqual([1, 2, 3, 4, 5]);
  });

  it("explains selected-interest recommendations without sensitive profiling", () => {
    const results = recommendCoursesByRules({
      completedCourseIds: new Set(),
      courses: [course("risk-course", ["risk"])],
      enrolledCourseIds: new Set(),
      interests: ["risk"],
    });
    expect(results[0]?.reason).toBe("selected-interest");
    expect(results[0]?.reasonText).toBe(
      recommendationReasonText("selected-interest"),
    );
    expect(JSON.stringify(results)).not.toMatch(/income|age|gender|ethnicity/i);
  });

  it("excludes enrolled courses and courses with unmet prerequisites", () => {
    const prerequisite = course("advanced");
    prerequisite.prerequisiteCourseIds = ["missing"];
    expect(
      recommendCoursesByRules({
        completedCourseIds: new Set(),
        courses: [course("enrolled"), prerequisite],
        enrolledCourseIds: new Set(["enrolled"]),
        interests: [],
      }),
    ).toEqual([]);
  });
});
