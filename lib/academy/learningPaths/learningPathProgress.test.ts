import { describe, expect, it } from "vitest";
import type {
  AcademyCourse,
  AcademyLearningPath,
  AcademyLearningPathEnrollment,
} from "@/types/academy";
import { calculateLearningPathProgress } from "./learningPathProgress";

function course(
  id: string,
  overrides: Partial<AcademyCourse> = {},
): AcademyCourse {
  return {
    accessLevel: "free",
    certificateEnabled: false,
    category: null,
    coverImage: null,
    description: [],
    difficulty: "beginner",
    durationMinutes: 60,
    excerpt: `${id} course summary`,
    featured: false,
    id,
    instructor: null,
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
    publishedAt: "2026-01-01T00:00:00Z",
    slug: id,
    status: "published",
    tags: [],
    targetAudience: [],
    title: id,
    updatedAt: "2026-01-01T00:00:00Z",
    version: 1,
    ...overrides,
  };
}

function path(
  overrides: Partial<AcademyLearningPath> = {},
): AcademyLearningPath {
  const first = course("course-1");
  const optional = course("course-optional");
  const second = course("course-2");
  return {
    accessLevel: "free",
    category: null,
    courses: [
      { course: first, required: true },
      { course: optional, required: false },
      { course: second, required: true },
    ],
    coverImage: null,
    description: [],
    difficulty: "beginner",
    durationMinutes: 180,
    featured: false,
    id: "path-1",
    prerequisitePathIds: [],
    publishedAt: "2026-01-01T00:00:00Z",
    requiredCourseIds: [first.id, second.id],
    slug: "path-1",
    status: "published",
    targetAudience: [],
    title: "Path one",
    version: 1,
    ...overrides,
  };
}

const enrollment: AcademyLearningPathEnrollment = {
  completedAt: null,
  currentCourseId: "course-1",
  enrolledAt: "2026-02-01T00:00:00Z",
  id: "path-enrollment-1",
  learningPathId: "path-1",
  learningPathVersion: 1,
  progressPercent: 0,
  startedAt: null,
  status: "in_progress",
  userId: "user-1",
};

describe("learning path progress", () => {
  it("counts required and optional courses separately", () => {
    const result = calculateLearningPathProgress({
      completedCourseIds: new Set(["course-1", "course-optional"]),
      courseEnrollments: [],
      enrollment,
      hasPremiumAccess: false,
      path: path(),
    });
    expect(result.progressPercent).toBe(50);
    expect(result.completedRequiredCourses).toBe(1);
    expect(result.completedOptionalCourses).toBe(1);
  });

  it("selects the next required course before an optional course", () => {
    const result = calculateLearningPathProgress({
      completedCourseIds: new Set(["course-1"]),
      courseEnrollments: [],
      enrollment: { ...enrollment, currentCourseId: null },
      hasPremiumAccess: false,
      path: path(),
    });
    expect(result.nextCourse?.id).toBe("course-2");
  });

  it("provides textual locks for sequential prerequisites", () => {
    const result = calculateLearningPathProgress({
      completedCourseIds: new Set(),
      courseEnrollments: [],
      enrollment,
      hasPremiumAccess: false,
      path: path(),
    });
    expect(result.nodes[2]).toMatchObject({
      lockReason: "Complete the earlier required course first.",
      state: "locked",
    });
  });

  it("does not unlock premium courses without verified membership", () => {
    const premiumPath = path({
      courses: [
        {
          course: course("premium", { accessLevel: "premium" }),
          required: true,
        },
      ],
      requiredCourseIds: ["premium"],
    });
    const result = calculateLearningPathProgress({
      completedCourseIds: new Set(),
      courseEnrollments: [],
      enrollment,
      hasPremiumAccess: false,
      path: premiumPath,
    });
    expect(result.nodes[0].state).toBe("premium");
    expect(result.nodes[0].lockReason).toMatch(/Premium membership/);
  });

  it("marks archived courses explicitly", () => {
    const archivedPath = path({
      courses: [
        {
          course: course("archived", { status: "archived" }),
          required: true,
        },
      ],
      requiredCourseIds: ["archived"],
    });
    const result = calculateLearningPathProgress({
      completedCourseIds: new Set(),
      courseEnrollments: [],
      enrollment,
      hasPremiumAccess: true,
      path: archivedPath,
    });
    expect(result.nodes[0].state).toBe("archived");
  });

  it("preserves historical completion across path version changes", () => {
    const versionedPath = path({
      courses: [
        { course: course("course-1", { version: 3 }), required: true },
        { course: course("new-course"), required: false },
      ],
      requiredCourseIds: ["course-1"],
      version: 2,
    });
    const result = calculateLearningPathProgress({
      completedCourseIds: new Set(["course-1"]),
      courseEnrollments: [],
      enrollment,
      hasPremiumAccess: true,
      path: versionedPath,
    });
    expect(result.progressPercent).toBe(100);
    expect(enrollment.learningPathVersion).toBe(1);
    expect(result.nodes[0].state).toBe("completed");
  });
});
