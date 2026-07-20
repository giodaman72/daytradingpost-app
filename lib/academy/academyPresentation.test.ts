import { describe, expect, it } from "vitest";
import type { AcademyCourse, AcademyVideo } from "@/types/academy";
import {
  filterAcademyCourses,
  formatAcademyDuration,
  getAcademyVideoSource,
  isSafeAcademyResourceUrl,
  normalizeAcademyVideoResumePosition,
} from "./academyPresentation";

const course = (overrides: Partial<AcademyCourse> = {}): AcademyCourse => ({
  accessLevel: "free",
  certificateEnabled: false,
  category: { id: "cat", slug: "risk", title: "Risk" },
  coverImage: null,
  description: [],
  difficulty: "beginner",
  durationMinutes: 90,
  excerpt: "Build a repeatable risk process.",
  featured: false,
  id: "course-1",
  instructor: {
    id: "instructor-1",
    name: "Alex Morgan",
    professionalTitle: "Trading educator",
    slug: "alex-morgan",
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
  publishedAt: "2026-01-01T00:00:00Z",
  slug: "risk-foundations",
  status: "published",
  tags: ["risk"],
  targetAudience: [],
  title: "Risk foundations",
  updatedAt: "2026-01-01T00:00:00Z",
  version: 1,
  ...overrides,
});

const video = (overrides: Partial<AcademyVideo>): AcademyVideo => ({
  accessLevel: "free",
  captions: [],
  chapters: [],
  downloadable: false,
  durationSeconds: 600,
  playbackUrl: null,
  posterImageUrl: null,
  provider: "youtube",
  providerVideoId: null,
  transcript: null,
  ...overrides,
});

describe("Academy presentation helpers", () => {
  it("formats course durations deterministically", () => {
    expect(formatAcademyDuration(45)).toBe("45 min");
    expect(formatAcademyDuration(120)).toBe("2 hr");
    expect(formatAcademyDuration(135)).toBe("2 hr 15 min");
  });

  it("filters catalog content by query, level, and access", () => {
    const courses = [
      course(),
      course({
        accessLevel: "premium",
        difficulty: "advanced",
        id: "course-2",
        tags: ["options"],
        title: "Advanced options",
      }),
    ];
    expect(
      filterAcademyCourses(courses, {
        access: "premium",
        difficulty: "advanced",
        query: "options",
      }),
    ).toHaveLength(1);
    expect(filterAcademyCourses(courses, { query: "Alex" })).toHaveLength(2);
  });

  it("creates privacy-enhanced provider URLs and rejects unsafe resources", () => {
    expect(
      getAcademyVideoSource(
        video({ provider: "youtube", providerVideoId: "abc_DEF-12" }),
      ),
    ).toEqual({
      kind: "iframe",
      src: "https://www.youtube-nocookie.com/embed/abc_DEF-12?enablejsapi=1&rel=0",
    });
    expect(isSafeAcademyResourceUrl("https://cdn.sanity.io/file.pdf")).toBe(
      true,
    );
    expect(isSafeAcademyResourceUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeAcademyResourceUrl("/api/academy/resources/resource-1")).toBe(
      true,
    );
    expect(
      getAcademyVideoSource(
        video({
          playbackUrl: "https://attacker.example/video.mp4",
          provider: "mux",
        }),
      ),
    ).toEqual({ kind: "unavailable", src: null });
  });

  it("normalizes saved video positions without resuming near completion", () => {
    expect(normalizeAcademyVideoResumePosition(125.8, 600)).toBe(125);
    expect(normalizeAcademyVideoResumePosition(590, 600)).toBe(0);
    expect(normalizeAcademyVideoResumePosition(-2, 600)).toBe(0);
  });
});
