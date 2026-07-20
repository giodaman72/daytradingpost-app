import "server-only";

import { enforceMutationRateLimit } from "@/lib/mutationRateLimit";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAcademyUser } from "./academyAuthorization";
import {
  ACADEMY_ANALYTICS_EVENTS,
  type AcademyAnalyticsEventName,
} from "./academyAnalytics";
import { AcademyError } from "./academyErrors";
import {
  normalizePlainText,
  parseAcademyIdentifier,
} from "./academyValidation";

export async function recordAcademyEvent(input: {
  assessmentId?: string;
  courseId?: string;
  idempotencyKey: string;
  lessonId?: string;
  moduleId?: string;
  name: string;
}) {
  const access = await requireAcademyUser();
  enforceMutationRateLimit(access.userId, "academy-analytics", 120, 60_000);
  if (
    !ACADEMY_ANALYTICS_EVENTS.includes(input.name as AcademyAnalyticsEventName)
  )
    throw new AcademyError(
      "ACADEMY_VALIDATION_FAILED",
      "Unknown Academy event.",
    );
  const identifier = (value: string | undefined, label: string) =>
    value ? parseAcademyIdentifier(value, label) : null;
  const { error } = await getSupabaseAdmin()
    .from("academy_events")
    .insert({
      assessment_id: identifier(input.assessmentId, "assessment ID"),
      course_id: identifier(input.courseId, "course ID"),
      event_name: input.name,
      idempotency_key: normalizePlainText(
        input.idempotencyKey,
        "Idempotency key",
        160,
      ),
      lesson_id: identifier(input.lessonId, "lesson ID"),
      metadata: {},
      module_id: identifier(input.moduleId, "module ID"),
      user_id: access.userId,
    });
  if (error?.code === "23505") return;
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Academy analytics could not be recorded.",
    );
}
