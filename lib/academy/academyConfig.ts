import "server-only";

import type { AcademyMembershipLimits } from "@/types/academy";

function boundedInteger(
  name: string,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number(process.env[name]);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max
    ? parsed
    : fallback;
}

export const academyConfig = Object.freeze({
  certificateVerificationBaseUrl:
    process.env.ACADEMY_CERTIFICATE_VERIFICATION_BASE_URL?.replace(/\/$/, "") ||
    null,
  maxBookmarkLabelLength: 120,
  maxBookmarksPerUser: boundedInteger(
    "ACADEMY_MAX_BOOKMARKS_PER_USER",
    250,
    1,
    5_000,
  ),
  maxNoteLength: boundedInteger("ACADEMY_MAX_NOTE_LENGTH", 5_000, 100, 20_000),
  maxNotesPerUser: boundedInteger("ACADEMY_MAX_NOTES_PER_USER", 500, 1, 10_000),
  progressReminderDays: boundedInteger(
    "ACADEMY_PROGRESS_REMINDER_DAYS",
    7,
    1,
    365,
  ),
  videoCompletionPercent: boundedInteger(
    "ACADEMY_VIDEO_COMPLETION_PERCENT",
    80,
    1,
    100,
  ),
  videoEndThresholdSeconds: boundedInteger(
    "ACADEMY_VIDEO_END_THRESHOLD_SECONDS",
    30,
    0,
    600,
  ),
});

export function getAcademyMembershipLimits(
  hasPremiumAccess: boolean,
): AcademyMembershipLimits {
  return {
    canAccessPremiumCourses: hasPremiumAccess,
    canEarnCertificates: hasPremiumAccess,
    maxAssessmentAttempts: hasPremiumAccess ? 10 : 3,
    maxBookmarks: hasPremiumAccess
      ? academyConfig.maxBookmarksPerUser
      : Math.min(25, academyConfig.maxBookmarksPerUser),
    maxNotes: hasPremiumAccess
      ? academyConfig.maxNotesPerUser
      : Math.min(50, academyConfig.maxNotesPerUser),
    tutorDailyLimit: hasPremiumAccess ? 50 : 5,
  };
}
