import { describe, expect, it } from "vitest";
import {
  ACADEMY_ANALYTICS_PRIVACY_THRESHOLD,
  parseAcademyAnalyticsFilters,
  privacySafeMetric,
} from "./academyAnalyticsService";

describe("Academy analytics privacy and filters", () => {
  it("suppresses sensitive small-cohort metrics", () => {
    const metric = privacySafeMetric(
      "passRate",
      "Pass rate",
      80,
      ACADEMY_ANALYTICS_PRIVACY_THRESHOLD - 1,
      true,
    );
    expect(metric).toMatchObject({
      suppressed: true,
      value: null,
    });
    expect(
      privacySafeMetric(
        "passRate",
        "Pass rate",
        80,
        ACADEMY_ANALYTICS_PRIVACY_THRESHOLD,
        true,
      ),
    ).toMatchObject({ suppressed: false, value: 80 });
  });

  it("validates dates, range and identifier filters", () => {
    expect(
      parseAcademyAnalyticsFilters({
        course: "course-1",
        from: "2026-07-01",
        instructor: "instructor-1",
        to: "2026-07-20",
      }),
    ).toMatchObject({
      courseId: "course-1",
      dateFrom: "2026-07-01",
      dateTo: "2026-07-20",
      instructorId: "instructor-1",
    });
    expect(() =>
      parseAcademyAnalyticsFilters({
        from: "2025-01-01",
        to: "2026-07-20",
      }),
    ).toThrow();
    expect(
      parseAcademyAnalyticsFilters({ course: "../../private" }).courseId,
    ).toBeNull();
  });
});
