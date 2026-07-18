import { describe, expect, it } from "vitest";
import {
  canAttemptAssessment,
  canEnrollInCourse,
  canViewCourse,
  canViewLesson,
} from "./academyAccess";

const published = {
  accessLevel: "free" as const,
  authenticated: true,
  hasPremiumAccess: false,
  publishedAt: "2026-01-01T00:00:00.000Z",
  status: "published" as const,
  now: new Date("2026-02-01T00:00:00.000Z"),
};

describe("Academy access", () => {
  it("allows a published free course", () => {
    expect(canViewCourse(published)).toEqual({
      allowed: true,
      reason: "allowed",
    });
  });

  it("denies draft content", () => {
    expect(canViewCourse({ ...published, status: "draft" }).reason).toBe(
      "not-published",
    );
  });

  it("denies scheduled future content", () => {
    expect(
      canViewCourse({
        ...published,
        publishedAt: "2027-01-01T00:00:00.000Z",
      }).reason,
    ).toBe("not-published");
  });

  it("requires authentication before premium membership", () => {
    expect(
      canViewCourse({
        ...published,
        accessLevel: "premium",
        authenticated: false,
      }).reason,
    ).toBe("authentication-required");
  });

  it("denies a premium course to a free member", () => {
    expect(canViewCourse({ ...published, accessLevel: "premium" }).reason).toBe(
      "premium-required",
    );
  });

  it("allows administrative preview of a draft", () => {
    expect(
      canViewCourse({
        ...published,
        administrativePreview: true,
        status: "draft",
      }).allowed,
    ).toBe(true);
  });

  it("enforces course prerequisites", () => {
    expect(
      canEnrollInCourse({ ...published, prerequisitesMet: false }).reason,
    ).toBe("prerequisite-not-met");
  });

  it("requires an enrollment for lessons", () => {
    expect(
      canViewLesson({
        courseAccess: { allowed: true, reason: "allowed" },
        enrolled: false,
        enrollmentStatus: null,
        prerequisitesMet: true,
      }).reason,
    ).toBe("not-enrolled");
  });

  it("denies revoked enrollments", () => {
    expect(
      canViewLesson({
        courseAccess: { allowed: true, reason: "allowed" },
        enrolled: true,
        enrollmentStatus: "revoked",
        prerequisitesMet: true,
      }).reason,
    ).toBe("enrollment-inactive");
  });

  it("enforces assessment availability windows and attempt limits", () => {
    const access = { allowed: true, reason: "allowed" as const };
    expect(
      canAttemptAssessment({
        access,
        attemptsUsed: 0,
        availableFrom: "2026-03-01T00:00:00.000Z",
        availableUntil: null,
        maximumAttempts: 3,
        now: new Date("2026-02-01T00:00:00.000Z"),
      }).reason,
    ).toBe("outside-availability-window");
    expect(
      canAttemptAssessment({
        access,
        attemptsUsed: 3,
        availableFrom: null,
        availableUntil: null,
        maximumAttempts: 3,
      }).reason,
    ).toBe("attempt-limit-reached");
  });
});
