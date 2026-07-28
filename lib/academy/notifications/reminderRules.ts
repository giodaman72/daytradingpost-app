import type { AcademyLearnerPreferences } from "@/types/academy";
import type { AcademyMilestone } from "../academyNotifications";

export type AcademyReminderState = {
  assessmentExpiresAt?: string | null;
  lastAccessedAt: string;
  progressPercent: number;
  status: string;
};

export function preferenceAllowsAcademyNotification(
  milestone: AcademyMilestone,
  preferences: AcademyLearnerPreferences,
) {
  if (preferences.unsubscribedAll) return false;
  if (milestone === "assessment-expiry")
    return preferences.assessmentNotifications;
  if (milestone === "certificate-issued")
    return preferences.certificateNotifications;
  if (
    milestone === "course-completed" ||
    milestone === "module-completed" ||
    milestone === "learning-path-milestone"
  )
    return preferences.completionNotifications;
  if (milestone === "new-course-content")
    return preferences.academyAnnouncements;
  return preferences.courseReminders;
}

export function eligibleAcademyReminders(
  state: AcademyReminderState,
  now: Date,
  inactiveDays: number,
) {
  if (!["enrolled", "in_progress", "paused"].includes(state.status)) return [];
  const reminders: AcademyMilestone[] = [];
  const inactivityThreshold =
    now.getTime() - Math.max(1, inactiveDays) * 24 * 60 * 60 * 1000;
  if (
    state.progressPercent > 0 &&
    state.progressPercent < 100 &&
    new Date(state.lastAccessedAt).getTime() <= inactivityThreshold
  )
    reminders.push("resume-reminder", "course-progress-reminder");
  if (state.assessmentExpiresAt) {
    const expiry = new Date(state.assessmentExpiresAt).getTime();
    const remaining = expiry - now.getTime();
    if (remaining > 0 && remaining <= 24 * 60 * 60 * 1000)
      reminders.push("assessment-expiry");
  }
  return reminders;
}

export function academyEmailDeliveryAllowed(
  preferences: AcademyLearnerPreferences,
  providerConfigured: boolean,
) {
  return (
    providerConfigured &&
    preferences.emailEnabled &&
    !preferences.unsubscribedAll
  );
}
