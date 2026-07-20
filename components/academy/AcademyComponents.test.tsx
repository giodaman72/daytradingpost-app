import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  AcademyCourseDetail,
  AcademyLearningState,
} from "@/types/academy";
import { AcademyCatalogGrid } from "./AcademyCatalogGrid";
import { CourseCurriculum } from "./CourseCurriculum";

const course: AcademyCourseDetail = {
  accessLevel: "free",
  certificateEnabled: false,
  category: null,
  coverImage: null,
  description: [],
  difficulty: "beginner",
  durationMinutes: 60,
  excerpt: "A structured introduction to market risk and process.",
  featured: true,
  id: "course-1",
  instructor: null,
  learningObjectives: ["Define risk before entry"],
  legacySlug: null,
  moduleIds: ["module-1"],
  modules: [
    {
      accessLevel: "free",
      courseId: "course-1",
      description: "Start with the risk framework.",
      durationMinutes: 60,
      id: "module-1",
      learningObjectives: [],
      lessonIds: ["lesson-1", "lesson-2"],
      lessons: [
        {
          accessLevel: "free",
          aiTutorEnabled: true,
          assessmentId: null,
          completionMode: "manual",
          courseId: "course-1",
          durationMinutes: 20,
          id: "lesson-1",
          learningObjectives: [],
          lessonType: "text",
          moduleId: "module-1",
          order: 1,
          prerequisiteLessonIds: [],
          requiredForCompletion: true,
          slug: "risk-basics",
          status: "published",
          summary: "Risk basics",
          title: "Risk basics",
          version: 1,
        },
        {
          accessLevel: "free",
          aiTutorEnabled: true,
          assessmentId: null,
          completionMode: "manual",
          courseId: "course-1",
          durationMinutes: 40,
          id: "lesson-2",
          learningObjectives: [],
          lessonType: "mixed",
          moduleId: "module-1",
          order: 2,
          prerequisiteLessonIds: ["lesson-1"],
          requiredForCompletion: true,
          slug: "risk-practice",
          status: "published",
          summary: "Risk practice",
          title: "Risk practice",
          version: 1,
        },
      ],
      order: 1,
      prerequisiteModuleIds: [],
      requiredForCompletion: true,
      slug: "foundations",
      status: "published",
      title: "Foundations",
      version: 1,
    },
  ],
  passingRequirements: {
    finalAssessmentId: null,
    minimumAssessmentPercent: null,
    requireAllRequiredLessons: true,
    requireAllRequiredModules: true,
  },
  prerequisiteCourseIds: [],
  publishedAt: "2026-01-01T00:00:00Z",
  seoDescription: "Learn risk foundations.",
  seoImage: null,
  seoTitle: "Risk foundations",
  slug: "risk-foundations",
  status: "published",
  tags: ["risk"],
  targetAudience: [],
  title: "Risk foundations",
  updatedAt: "2026-01-01T00:00:00Z",
  version: 1,
};

const learningState: AcademyLearningState = {
  enrollment: {
    accessSnapshot: {},
    completedAt: null,
    courseId: "course-1",
    courseSlug: "risk-foundations",
    courseVersion: 1,
    enrolledAt: "2026-01-01T00:00:00Z",
    id: "enrollment-1",
    lastAccessedAt: null,
    progressPercent: 50,
    startedAt: null,
    status: "in_progress",
    userId: "user-1",
  },
  lessonProgress: [
    {
      completedAt: "2026-01-01T00:00:00Z",
      completionMethod: "manual",
      contentViewedAt: null,
      enrollmentId: "enrollment-1",
      id: "progress-1",
      lastAccessedAt: null,
      lessonId: "lesson-1",
      lessonVersion: 1,
      progressPercent: 100,
      status: "completed",
      userId: "user-1",
      videoDurationSeconds: null,
      videoPositionSeconds: null,
    },
    {
      completedAt: null,
      completionMethod: null,
      contentViewedAt: null,
      enrollmentId: "enrollment-1",
      id: "progress-2",
      lastAccessedAt: null,
      lessonId: "lesson-2",
      lessonVersion: 1,
      progressPercent: 0,
      status: "locked",
      userId: "user-1",
      videoDurationSeconds: null,
      videoPositionSeconds: null,
    },
  ],
  moduleProgress: [],
};

describe("Academy learner components", () => {
  it("renders the empty catalog state without nonfunctional controls", () => {
    render(<AcademyCatalogGrid courses={[]} />);
    expect(screen.getByText("Courses are on the way.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("links available lessons and renders locked lessons without a link", () => {
    render(<CourseCurriculum course={course} learningState={learningState} />);
    expect(screen.getByRole("link", { name: /Risk basics/ })).toHaveAttribute(
      "href",
      "/academy/courses/risk-foundations/learn/risk-basics",
    );
    expect(screen.getByLabelText("Risk practice, locked")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Risk practice/ }),
    ).not.toBeInTheDocument();
  });
});
