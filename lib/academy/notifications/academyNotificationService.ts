import "server-only";

import { createNotification } from "@/lib/notifications";
import type { AcademyMilestone } from "../academyNotifications";
import { createAcademyMilestoneNotification } from "../academyNotifications";
import { findAcademyPreferences } from "../personalization/preferencesRepository";
import { preferenceAllowsAcademyNotification } from "./reminderRules";

export async function deliverAcademyDashboardNotification(input: {
  courseSlug: string;
  courseTitle: string;
  milestone: AcademyMilestone;
  userId: string;
}) {
  const preferences = await findAcademyPreferences(input.userId);
  if (!preferenceAllowsAcademyNotification(input.milestone, preferences))
    return null;
  return createNotification(createAcademyMilestoneNotification(input));
}
