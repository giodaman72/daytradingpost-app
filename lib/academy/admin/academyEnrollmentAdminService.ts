import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AcademyAdminEnrollment } from "@/types/academy-admin";
import type { AcademyCourseDetail } from "@/types/academy";
import { requireAcademyPermission } from "./academyAdminAuthorization";
import { AcademyError } from "../academyErrors";
import { enforceAcademyRateLimit } from "../academyRateLimit";
import {
  normalizePlainText,
  parseAcademyIdentifier,
  parseAcademySlug,
} from "../academyValidation";
import { getAcademyCourse } from "../academyService";

function curriculumPayload(course: AcademyCourseDetail) {
  const modules = course.modules
    .filter((courseModule) => courseModule.status === "published")
    .toSorted((a, b) => a.order - b.order);
  const modulePrerequisites = new Map(
    modules.map((courseModule) => [
      courseModule.id,
      new Set(courseModule.prerequisiteModuleIds),
    ]),
  );
  return {
    lessons: modules.flatMap((courseModule) =>
      courseModule.lessons
        .filter((lesson) => lesson.status === "published")
        .map((lesson) => ({
          available:
            (modulePrerequisites.get(courseModule.id)?.size ?? 0) === 0 &&
            lesson.prerequisiteLessonIds.length === 0,
          id: lesson.id,
          module_id: courseModule.id,
          required_for_completion: lesson.requiredForCompletion,
          version: lesson.version,
        })),
    ),
    modules: modules.map((courseModule) => ({
      available: (modulePrerequisites.get(courseModule.id)?.size ?? 0) === 0,
      id: courseModule.id,
      required_for_completion: courseModule.requiredForCompletion,
      required_lessons_count: courseModule.lessons.filter(
        (lesson) =>
          lesson.status === "published" && lesson.requiredForCompletion,
      ).length,
      version: courseModule.version,
    })),
  };
}

export async function listAdminAcademyEnrollments(filters: {
  query?: string;
  status?: string;
}) {
  await requireAcademyPermission("academy:manage-enrollments");
  let query = getSupabaseAdmin()
    .from("academy_enrollments")
    .select(
      "id,user_id,course_id,course_slug,course_version,status,progress_percent,enrolled_at,last_accessed_at",
    )
    .order("updated_at", { ascending: false })
    .limit(500);
  if (
    filters.status &&
    [
      "enrolled",
      "in_progress",
      "completed",
      "paused",
      "revoked",
      "expired",
      "archived",
    ].includes(filters.status)
  )
    query = query.eq("status", filters.status);
  const { data, error } = await query;
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Enrollment administration is unavailable.",
    );
  const userIds = [...new Set((data ?? []).map((row) => String(row.user_id)))];
  const { data: profiles } = userIds.length
    ? await getSupabaseAdmin()
        .from("profiles")
        .select("id,full_name")
        .in("id", userIds)
    : { data: [] };
  const names = new Map(
    (profiles ?? []).map((profile) => [
      String(profile.id),
      String(profile.full_name || "Learner"),
    ]),
  );
  const records: AcademyAdminEnrollment[] = (data ?? []).map((row) => ({
    courseId: String(row.course_id),
    courseSlug: String(row.course_slug),
    courseVersion: Number(row.course_version),
    enrolledAt: String(row.enrolled_at),
    id: String(row.id),
    learnerDisplayName: names.get(String(row.user_id)) ?? "Learner",
    lastAccessedAt: row.last_accessed_at ? String(row.last_accessed_at) : null,
    progressPercent: Number(row.progress_percent),
    status: row.status as AcademyAdminEnrollment["status"],
    userId: String(row.user_id),
  }));
  const search = filters.query?.trim().toLowerCase();
  return search
    ? records.filter((record) =>
        [
          record.id,
          record.userId,
          record.learnerDisplayName,
          record.courseSlug,
          record.courseId,
        ].some((value) => value.toLowerCase().includes(search)),
      )
    : records;
}

export async function manuallyEnrollAcademyLearner(input: {
  courseSlug: string;
  requestId: string;
  userId: string;
}) {
  const actor = await requireAcademyPermission("academy:manage-enrollments");
  enforceAcademyRateLimit(actor.userId, "admin-enrollment", 20);
  const userId = parseAcademyIdentifier(input.userId, "learner ID");
  const course = await getAcademyCourse(parseAcademySlug(input.courseSlug));
  const requestId = normalizePlainText(input.requestId, "Request ID", 160);
  const curriculum = curriculumPayload(course);
  const { data, error } = await getSupabaseAdmin().rpc(
    "admin_enroll_academy_course",
    {
      p_access_snapshot: {
        accessLevel: course.accessLevel,
        administered: true,
      },
      p_actor_user_id: actor.userId,
      p_course_id: course.id,
      p_course_slug: course.slug,
      p_course_version: course.version,
      p_lessons: curriculum.lessons,
      p_modules: curriculum.modules,
      p_request_id: requestId,
      p_user_id: userId,
    },
  );
  if (error)
    throw new AcademyError(
      error.code === "23505"
        ? "ACADEMY_ALREADY_ENROLLED"
        : "ACADEMY_PROVIDER_UNAVAILABLE",
      error.code === "23505"
        ? "The learner already has an active enrollment."
        : "The learner could not be enrolled.",
    );
  return String(data);
}

export async function manageAcademyEnrollment(input: {
  action: "pause" | "revoke" | "restore" | "reset";
  confirmation?: string;
  enrollmentId: string;
  reason: string;
  requestId: string;
}) {
  const actor = await requireAcademyPermission("academy:manage-enrollments");
  enforceAcademyRateLimit(actor.userId, "admin-enrollment", 20);
  const confirmation =
    input.action === "reset"
      ? normalizePlainText(input.confirmation, "Confirmation", 40)
      : "";
  if (input.action === "reset" && confirmation !== "RESET PROGRESS")
    throw new AcademyError(
      "ACADEMY_VALIDATION_FAILED",
      'Type "RESET PROGRESS" to confirm this destructive action.',
    );
  const { data, error } = await getSupabaseAdmin().rpc(
    "admin_manage_academy_enrollment",
    {
      p_action: input.action,
      p_actor_user_id: actor.userId,
      p_confirmation: confirmation,
      p_enrollment_id: parseAcademyIdentifier(
        input.enrollmentId,
        "enrollment ID",
      ),
      p_reason: normalizePlainText(input.reason, "Reason", 500),
      p_request_id: normalizePlainText(input.requestId, "Request ID", 160),
    },
  );
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "The enrollment action could not be completed.",
    );
  return String(data);
}
