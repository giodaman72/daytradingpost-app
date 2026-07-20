import "server-only";

import { enforceMutationRateLimit } from "@/lib/mutationRateLimit";
import type { AcademyLearnerPreferences } from "@/types/academy";
import { requireAcademyUser } from "../academyAuthorization";
import { AcademyError } from "../academyErrors";
import { normalizePlainText } from "../academyValidation";
import {
  findAcademyPreferences,
  upsertAcademyPreferences,
} from "./preferencesRepository";

export async function getAcademyPreferences() {
  const access = await requireAcademyUser();
  return findAcademyPreferences(access.userId);
}

export async function saveAcademyPreferences(input: unknown) {
  const access = await requireAcademyUser();
  enforceMutationRateLimit(access.userId, "academy-preferences", 12, 60_000);
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new AcademyError(
      "ACADEMY_VALIDATION_FAILED",
      "Invalid Academy preferences.",
    );
  const raw = input as Record<string, unknown>;
  const bool = (key: string) => {
    if (typeof raw[key] !== "boolean")
      throw new AcademyError(
        "ACADEMY_VALIDATION_FAILED",
        `Invalid ${key} preference.`,
      );
    return raw[key] as boolean;
  };
  const interests = Array.isArray(raw.interests)
    ? [
        ...new Set(
          raw.interests.map((item) =>
            normalizePlainText(item, "Interest", 60).toLowerCase(),
          ),
        ),
      ].slice(0, 20)
    : [];
  const preferences: Omit<AcademyLearnerPreferences, "updatedAt" | "userId"> = {
    academyAnnouncements: bool("academyAnnouncements"),
    assessmentNotifications: bool("assessmentNotifications"),
    certificateNotifications: bool("certificateNotifications"),
    completionNotifications: bool("completionNotifications"),
    courseReminders: bool("courseReminders"),
    emailEnabled: bool("emailEnabled"),
    interests,
    unsubscribedAll: bool("unsubscribedAll"),
  };
  if (preferences.unsubscribedAll) preferences.emailEnabled = false;
  return upsertAcademyPreferences(access.userId, preferences);
}
