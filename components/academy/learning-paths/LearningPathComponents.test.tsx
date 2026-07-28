import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AcademyCourse, AcademyLearningPathNode } from "@/types/academy";
import { LearningPathCourseMap } from "./LearningPathCourseMap";
import { LearningPathEmptyState } from "./LearningPathEmptyState";

const course: AcademyCourse = {
  accessLevel: "free",
  certificateEnabled: false,
  category: null,
  coverImage: null,
  description: [],
  difficulty: "beginner",
  durationMinutes: 60,
  excerpt: "A structured course.",
  featured: false,
  id: "course-1",
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
  slug: "course-1",
  status: "published",
  tags: [],
  targetAudience: [],
  title: "Course one",
  updatedAt: "2026-01-01T00:00:00Z",
  version: 1,
};

describe("learning path components", () => {
  it("renders an accessible ordered course alternative with a state label", () => {
    const nodes: AcademyLearningPathNode[] = [
      { course, lockReason: null, required: true, state: "available" },
    ];
    render(<LearningPathCourseMap learningPathId="path-1" nodes={nodes} />);
    expect(
      screen.getByRole("list", { name: "Learning path course sequence" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Status: available")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open course/ })).toHaveAttribute(
      "href",
      "/academy/courses/course-1",
    );
  });

  it("renders a useful dashboard empty state", () => {
    render(<LearningPathEmptyState dashboard />);
    expect(
      screen.getByRole("heading", { name: "No learning paths enrolled yet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse learning paths" }),
    ).toHaveAttribute("href", "/academy/learning-paths");
  });
});
