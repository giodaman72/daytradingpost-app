import { describe, expect, it } from "vitest";
import type { AcademyCourse } from "@/types/academy";
import {
  academyCatalogQuery,
  filterAndSortAcademyCourses,
  paginateAcademyCourses,
  parseAcademyCatalogFilters,
} from "./academyCatalog";

function course(
  overrides: Partial<AcademyCourse> & Pick<AcademyCourse, "id" | "title">,
): AcademyCourse {
  return {
    accessLevel: "free",
    certificateEnabled: false,
    category: { id: "category", slug: "risk", title: "Risk" },
    coverImage: null,
    description: [],
    difficulty: "beginner",
    durationMinutes: 45,
    excerpt: "Course excerpt",
    featured: false,
    instructor: {
      id: "instructor",
      name: "Ada Trader",
      professionalTitle: null,
      slug: "ada-trader",
    },
    learningObjectives: [],
    legacySlug: null,
    moduleIds: [],
    passingRequirements: {
      finalAssessmentId: null,
      minimumAssessmentPercent: null,
      requireAllRequiredLessons: true,
      requireAllRequiredModules: true,
    },
    prerequisiteCourseIds: [],
    publishedAt: "2026-01-01T00:00:00.000Z",
    slug: overrides.id,
    status: "published",
    tags: [],
    targetAudience: [],
    updatedAt: "2026-01-01T00:00:00.000Z",
    version: 1,
    ...overrides,
  };
}

describe("Academy catalog", () => {
  it("validates query parameters and rejects arbitrary sort fields", () => {
    expect(
      parseAcademyCatalogFilters({
        access: "owner",
        category: "../../drafts",
        page: "-5",
        query: "  risk\u0000 ",
        sort: "_createdAt desc",
      }),
    ).toMatchObject({
      access: "all",
      category: "all",
      page: 1,
      query: "risk",
      sort: "recommended",
    });
  });

  it("filters across supported course fields and sorts deterministically", () => {
    const courses = [
      course({ id: "one", title: "Introduction", featured: true }),
      course({
        accessLevel: "premium",
        category: { id: "cat-2", slug: "technical", title: "Technical" },
        difficulty: "advanced",
        durationMinutes: 240,
        id: "two",
        tags: ["candlesticks"],
        title: "Advanced Charts",
      }),
    ];
    const filters = parseAcademyCatalogFilters({
      access: "premium",
      category: "technical",
      duration: "over-180",
      query: "candlesticks",
      sort: "title",
    });
    expect(filterAndSortAcademyCourses(courses, filters)).toEqual([courses[1]]);
  });

  it("preserves filters across pagination links", () => {
    const filters = parseAcademyCatalogFilters({
      difficulty: "beginner",
      query: "risk",
      sort: "shortest",
    });
    expect(academyCatalogQuery(filters, 2)).toBe(
      "query=risk&difficulty=beginner&sort=shortest&page=2",
    );
  });

  it("clamps pagination to the available result set", () => {
    const courses = Array.from({ length: 10 }, (_, index) =>
      course({ id: `course-${index}`, title: `Course ${index}` }),
    );
    expect(paginateAcademyCourses(courses, 99, 9)).toMatchObject({
      currentPage: 2,
      totalPages: 2,
      totalResults: 10,
    });
  });
});
