import { describe, expect, it } from "vitest";
import type { AcademyCourse } from "@/types/academy";
import {
  academyCourseLevel,
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

  it("orders levelled courses Level 1, 2, 3 with others after", () => {
    const videoLevelOne = {
      ...listBuiltInAcademyCourses(1)[0],
      id: "ta-level1-en",
      slug: "technical-analysis-level-1",
      tags: ["technical analysis", "video course", "level 1"],
      title: "Technical Analysis Level 1",
    } satisfies AcademyCourse;
    const guide = {
      ...videoLevelOne,
      id: "guide",
      slug: "a-beginners-guide-to-trading",
      tags: ["beginner"],
      title: "A Beginner's Guide to Trading",
    } satisfies AcademyCourse;
    const titles = mergeBuiltInAcademyCourses([guide, videoLevelOne]).map(
      (course) => course.title,
    );
    expect(titles).toEqual([
      "Technical Analysis Level 1",
      "Level 2: Applied Technical Analysis and Strategy Design",
      "Level 3: Professional Execution, Risk and Portfolio Integration",
      "A Beginner's Guide to Trading",
    ]);
  });

  it("reads Spanish level tags", () => {
    expect(
      academyCourseLevel({ tags: ["nivel 1"], title: "Análisis Técnico" }),
    ).toBe(1);
  });
});
