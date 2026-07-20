import { describe, expect, it } from "vitest";
import type { AcademyLearnerPreferences } from "@/types/academy";
import {
  academyEmailDeliveryAllowed,
  eligibleAcademyReminders,
  preferenceAllowsAcademyNotification,
} from "./reminderRules";
import { createAcademyMilestoneNotification } from "../academyNotifications";

const preferences: AcademyLearnerPreferences = {
  academyAnnouncements: true,
  assessmentNotifications: true,
  certificateNotifications: true,
  completionNotifications: true,
  courseReminders: true,
  emailEnabled: false,
  interests: [],
  unsubscribedAll: false,
  updatedAt: null,
  userId: "user",
};

describe("Academy notifications", () => {
  it("creates safe course deep links and stable idempotency keys", () => {
    const draft = createAcademyMilestoneNotification({
      courseSlug: "risk-basics",
      courseTitle: "Risk Basics",
      milestone: "course-completed",
      userId: "user",
    });
    expect(draft.link).toBe("/academy/courses/risk-basics");
    expect(draft.idempotencyKey).toBe("user:risk-basics:course-completed");
  });

  it("creates respectful inactivity and assessment-expiry reminders", () => {
    expect(
      eligibleAcademyReminders(
        {
          assessmentExpiresAt: "2026-07-20T18:00:00.000Z",
          lastAccessedAt: "2026-07-01T00:00:00.000Z",
          progressPercent: 30,
          status: "in_progress",
        },
        new Date("2026-07-20T00:00:00.000Z"),
        7,
      ),
    ).toEqual([
      "resume-reminder",
      "course-progress-reminder",
      "assessment-expiry",
    ]);
  });

  it("respects category preferences, global unsubscribe and email opt-in", () => {
    expect(
      preferenceAllowsAcademyNotification("assessment-expiry", {
        ...preferences,
        assessmentNotifications: false,
      }),
    ).toBe(false);
    expect(
      preferenceAllowsAcademyNotification("course-completed", {
        ...preferences,
        unsubscribedAll: true,
      }),
    ).toBe(false);
    expect(academyEmailDeliveryAllowed(preferences, true)).toBe(false);
    expect(
      academyEmailDeliveryAllowed({ ...preferences, emailEnabled: true }, true),
    ).toBe(true);
  });
});
