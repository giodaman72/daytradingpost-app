import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AcademyLearnerPreferences } from "@/types/academy";
import { AcademyError } from "../academyErrors";

export const DEFAULT_ACADEMY_PREFERENCES = {
  academyAnnouncements: true,
  assessmentNotifications: true,
  certificateNotifications: true,
  completionNotifications: true,
  courseReminders: true,
  emailEnabled: false,
  interests: [] as string[],
  unsubscribedAll: false,
} as const;

function mapPreferences(
  userId: string,
  row?: Record<string, unknown> | null,
): AcademyLearnerPreferences {
  return {
    academyAnnouncements:
      (row?.academy_announcements as boolean | undefined) ??
      DEFAULT_ACADEMY_PREFERENCES.academyAnnouncements,
    assessmentNotifications:
      (row?.assessment_notifications as boolean | undefined) ??
      DEFAULT_ACADEMY_PREFERENCES.assessmentNotifications,
    certificateNotifications:
      (row?.certificate_notifications as boolean | undefined) ??
      DEFAULT_ACADEMY_PREFERENCES.certificateNotifications,
    completionNotifications:
      (row?.completion_notifications as boolean | undefined) ??
      DEFAULT_ACADEMY_PREFERENCES.completionNotifications,
    courseReminders:
      (row?.course_reminders as boolean | undefined) ??
      DEFAULT_ACADEMY_PREFERENCES.courseReminders,
    emailEnabled:
      (row?.email_enabled as boolean | undefined) ??
      DEFAULT_ACADEMY_PREFERENCES.emailEnabled,
    interests: Array.isArray(row?.interests)
      ? row.interests.map(String).slice(0, 20)
      : [],
    unsubscribedAll:
      (row?.unsubscribed_all as boolean | undefined) ??
      DEFAULT_ACADEMY_PREFERENCES.unsubscribedAll,
    updatedAt: row?.updated_at ? String(row.updated_at) : null,
    userId,
  };
}

export async function findAcademyPreferences(userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_learner_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error && error.code !== "42P01")
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Academy preferences are unavailable.",
    );
  return mapPreferences(userId, data);
}

export async function upsertAcademyPreferences(
  userId: string,
  input: Omit<AcademyLearnerPreferences, "updatedAt" | "userId">,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_learner_preferences")
    .upsert(
      {
        academy_announcements: input.academyAnnouncements,
        assessment_notifications: input.assessmentNotifications,
        certificate_notifications: input.certificateNotifications,
        completion_notifications: input.completionNotifications,
        course_reminders: input.courseReminders,
        email_enabled: input.emailEnabled,
        interests: input.interests,
        unsubscribed_all: input.unsubscribedAll,
        user_id: userId,
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Academy preferences could not be saved.",
    );
  return mapPreferences(userId, data);
}
