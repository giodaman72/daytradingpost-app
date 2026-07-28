import { describe, expect, it } from "vitest";
import type { AcademyCourse } from "@/types/academy";
import { filterAdminCourses } from "./academyAdminContent";
import { validateCourseForPublication } from "./academyContentValidation";
import type { AcademyAdminCourse } from "@/types/academy-admin";

describe("Academy publishing and archive behavior", () => {
  it("blocks publication with missing objectives, lessons or unresolved status", () => {
    const issues = validateCourseForPublication({
      learningObjectives: [],
      modules: [
        {
          _id: "module-1",
          lessonIds: [],
          prerequisiteModuleIds: [],
          status: "draft",
        },
      ],
    } as unknown as AcademyCourse & {
      modules: Array<{
        _id: string;
        lessonIds: string[];
        prerequisiteModuleIds: string[];
        status: string;
      }>;
    });
    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "OBJECTIVES_REQUIRED",
        "UNPUBLISHED_MODULE",
        "LESSONS_REQUIRED",
      ]),
    );
  });

  it("keeps archived courses explicitly filterable instead of deleting them", () => {
    const archived = {
      archived: true,
      id: "archived",
      instructor: null,
      slug: "archived",
      status: "archived",
      title: "Archived Course",
      validationIssues: [],
    } as unknown as AcademyAdminCourse;
    const published = {
      ...archived,
      archived: false,
      id: "published",
      status: "published",
      title: "Published Course",
    } as AcademyAdminCourse;
    expect(
      filterAdminCourses([archived, published], { status: "archived" }),
    ).toEqual([archived]);
  });
});
