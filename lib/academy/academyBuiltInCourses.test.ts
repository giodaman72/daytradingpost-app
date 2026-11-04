import { describe, expect, it } from "vitest";
import {
  findBuiltInAcademyCourseBySlug,
  listBuiltInAcademyCourses,
  mergeBuiltInAcademyCourses,
} from "./academyBuiltInCourses";

describe("built-in academy courses", () => {
  it("keeps the replaced Level 1 course out of the catalog", () => {
    const slugs = [
      ...listBuiltInAcademyCourses(100),
      ...mergeBuiltInAcademyCourses([]),
    ].map((course) => course.slug);
    expect(slugs).not.toContain("level-1-technical-analysis-foundations");
  });

  it("still serves the replaced Level 1 course by URL for existing learners", () => {
    expect(
      findBuiltInAcademyCourseBySlug("level-1-technical-analysis-foundations"),
    ).not.toBeNull();
  });

  it("points Level 2 at the Level 1 video course", () => {
    const levelTwo = listBuiltInAcademyCourses(100).find(
      (course) => course.id === "course-dtp-level-2-applied-strategy",
    );
    expect(levelTwo?.prerequisiteCourseIds).toEqual(["ta-level1-en"]);
  });
});
