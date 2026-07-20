import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  AcademyAnalyticsDashboard,
  AcademyMetric,
} from "@/types/academy-admin";
import { requireAcademyPermission } from "./academyAdminAuthorization";
import { requireAcademyInstructor } from "./academyInstructorAuthorization";
import { AcademyError } from "../academyErrors";
import { academyConfig } from "../academyConfig";

export const ACADEMY_ANALYTICS_PRIVACY_THRESHOLD =
  academyConfig.analyticsPrivacyThreshold;

export type AcademyAnalyticsFilters = {
  courseId: string | null;
  dateFrom: string;
  dateTo: string;
  instructorId: string | null;
};

function parseDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback.toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)))
    throw new AcademyError(
      "ACADEMY_VALIDATION_FAILED",
      "Analytics dates must use YYYY-MM-DD.",
    );
  return value;
}

export function parseAcademyAnalyticsFilters(input: {
  course?: string | string[];
  from?: string | string[];
  instructor?: string | string[];
  to?: string | string[];
}): AcademyAnalyticsFilters {
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setUTCDate(monthAgo.getUTCDate() - 30);
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const dateFrom = parseDate(first(input.from), monthAgo);
  const dateTo = parseDate(first(input.to), today);
  const rangeDays =
    (Date.parse(`${dateTo}T00:00:00Z`) - Date.parse(`${dateFrom}T00:00:00Z`)) /
    86_400_000;
  if (rangeDays < 0 || rangeDays > 366)
    throw new AcademyError(
      "ACADEMY_VALIDATION_FAILED",
      "Analytics range must be between 0 and 366 days.",
    );
  const safeIdentifier = (value: string | undefined) =>
    value && /^[A-Za-z0-9_.:-]{1,200}$/.test(value) ? value : null;
  return {
    courseId: safeIdentifier(first(input.course)),
    dateFrom,
    dateTo,
    instructorId: safeIdentifier(first(input.instructor)),
  };
}

export function privacySafeMetric(
  key: string,
  label: string,
  value: number,
  cohortSize: number,
  sensitive = false,
): AcademyMetric {
  const suppressed =
    sensitive &&
    cohortSize > 0 &&
    cohortSize < ACADEMY_ANALYTICS_PRIVACY_THRESHOLD;
  return { key, label, suppressed, value: suppressed ? null : value };
}

type EventRow = {
  course_id: string | null;
  event_name: string;
  user_id: string | null;
};

function eventCount(events: EventRow[], name: string) {
  return events.filter((event) => event.event_name === name).length;
}

function rate(numerator: number, denominator: number) {
  return denominator ? Math.round((numerator / denominator) * 1000) / 10 : 0;
}

async function loadAnalytics(
  filters: AcademyAnalyticsFilters,
  allowedCourseIds?: readonly string[],
): Promise<AcademyAnalyticsDashboard> {
  let eventQuery = getSupabaseAdmin()
    .from("academy_events")
    .select("event_name,user_id,course_id")
    .gte("created_at", `${filters.dateFrom}T00:00:00.000Z`)
    .lte("created_at", `${filters.dateTo}T23:59:59.999Z`)
    .limit(50_000);
  let enrollmentQuery = getSupabaseAdmin()
    .from("academy_enrollments")
    .select("id,user_id,course_id,status,progress_percent")
    .gte("enrolled_at", `${filters.dateFrom}T00:00:00.000Z`)
    .lte("enrolled_at", `${filters.dateTo}T23:59:59.999Z`)
    .limit(20_000);
  let attemptQuery = getSupabaseAdmin()
    .from("academy_assessment_attempts")
    .select(
      "user_id,enrollment_id,status,passed,academy_enrollments!inner(course_id)",
    )
    .gte("started_at", `${filters.dateFrom}T00:00:00.000Z`)
    .lte("started_at", `${filters.dateTo}T23:59:59.999Z`)
    .limit(20_000);
  let certificateQuery = getSupabaseAdmin()
    .from("academy_certificates")
    .select("user_id,course_id,status")
    .gte("issued_at", `${filters.dateFrom}T00:00:00.000Z`)
    .lte("issued_at", `${filters.dateTo}T23:59:59.999Z`)
    .limit(20_000);
  const courseIds = filters.courseId
    ? [filters.courseId]
    : allowedCourseIds
      ? [...allowedCourseIds]
      : null;
  if (courseIds) {
    if (!courseIds.length)
      return {
        cohortSize: 0,
        filters,
        metrics: [],
        privacyThreshold: ACADEMY_ANALYTICS_PRIVACY_THRESHOLD,
      };
    eventQuery = eventQuery.in("course_id", courseIds);
    enrollmentQuery = enrollmentQuery.in("course_id", courseIds);
    attemptQuery = attemptQuery.in("academy_enrollments.course_id", courseIds);
    certificateQuery = certificateQuery.in("course_id", courseIds);
  }
  const [eventResult, enrollmentResult, attemptResult, certificateResult] =
    await Promise.all([
      eventQuery,
      enrollmentQuery,
      attemptQuery,
      certificateQuery,
    ]);
  const error =
    eventResult.error ??
    enrollmentResult.error ??
    attemptResult.error ??
    certificateResult.error;
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Academy analytics are unavailable.",
    );
  const events = (eventResult.data ?? []) as EventRow[];
  const enrollments = enrollmentResult.data ?? [];
  const attempts = attemptResult.data ?? [];
  const certificates = certificateResult.data ?? [];
  const cohortSize = new Set(enrollments.map((row) => String(row.user_id)))
    .size;
  const passedAttempts = attempts.filter((row) => row.passed === true).length;
  const failedAttempts = attempts.filter((row) => row.passed === false).length;
  const completedEnrollments = enrollments.filter(
    (row) => row.status === "completed",
  ).length;
  const activeLearners = new Set(
    enrollments
      .filter((row) =>
        ["enrolled", "in_progress", "paused"].includes(row.status),
      )
      .map((row) => String(row.user_id)),
  ).size;
  const courseViews = eventCount(events, "academy_course_viewed");
  const courseStarts = eventCount(events, "academy_course_started");
  const metrics = [
    privacySafeMetric(
      "catalogViews",
      "Catalog views",
      eventCount(events, "academy_catalog_viewed"),
      cohortSize,
    ),
    privacySafeMetric("courseViews", "Course views", courseViews, cohortSize),
    privacySafeMetric(
      "enrollments",
      "Enrollments",
      enrollments.length,
      cohortSize,
    ),
    privacySafeMetric(
      "activeLearners",
      "Active learners",
      activeLearners,
      cohortSize,
      true,
    ),
    privacySafeMetric(
      "enrollmentConversion",
      "View-to-enrollment rate",
      rate(enrollments.length, courseViews),
      cohortSize,
      true,
    ),
    privacySafeMetric(
      "courseStarts",
      "Course starts",
      courseStarts,
      cohortSize,
    ),
    privacySafeMetric(
      "lessonCompletions",
      "Lesson completions",
      eventCount(events, "academy_lesson_completed"),
      cohortSize,
    ),
    privacySafeMetric(
      "moduleCompletions",
      "Module completions",
      eventCount(events, "academy_module_completed"),
      cohortSize,
    ),
    privacySafeMetric(
      "courseCompletions",
      "Course completions",
      completedEnrollments,
      cohortSize,
    ),
    privacySafeMetric(
      "completionRate",
      "Completion rate",
      rate(completedEnrollments, enrollments.length),
      cohortSize,
      true,
    ),
    privacySafeMetric(
      "contentDropOff",
      "Started without completion",
      Math.max(0, courseStarts - completedEnrollments),
      cohortSize,
      true,
    ),
    privacySafeMetric(
      "assessmentAttempts",
      "Assessment attempts",
      attempts.length,
      cohortSize,
    ),
    privacySafeMetric(
      "assessmentPassRate",
      "Assessment pass rate",
      rate(passedAttempts, attempts.length),
      cohortSize,
      true,
    ),
    privacySafeMetric(
      "assessmentPassed",
      "Passed attempts",
      passedAttempts,
      cohortSize,
      true,
    ),
    privacySafeMetric(
      "assessmentFailed",
      "Failed attempts",
      failedAttempts,
      cohortSize,
      true,
    ),
    privacySafeMetric(
      "certificates",
      "Certificates issued",
      certificates.filter((row) => row.status === "issued").length,
      cohortSize,
    ),
    privacySafeMetric(
      "resourceDownloads",
      "Resource downloads",
      eventCount(events, "academy_resource_downloaded"),
      cohortSize,
    ),
    privacySafeMetric(
      "recommendationEngagement",
      "Recommendation opens",
      eventCount(events, "academy_recommendation_opened"),
      cohortSize,
    ),
  ];
  return {
    cohortSize,
    filters,
    metrics,
    privacyThreshold: ACADEMY_ANALYTICS_PRIVACY_THRESHOLD,
  };
}

export async function getAdminAcademyAnalytics(
  filters: AcademyAnalyticsFilters,
) {
  await requireAcademyPermission("academy:view-analytics");
  let allowedCourseIds: string[] | undefined;
  if (filters.instructorId) {
    const { data, error } = await getSupabaseAdmin()
      .from("academy_instructor_assignments")
      .select("course_id")
      .eq("instructor_id", filters.instructorId)
      .eq("active", true);
    if (error?.code !== "42P01" && error)
      throw new AcademyError(
        "ACADEMY_PROVIDER_UNAVAILABLE",
        "Instructor filter is unavailable.",
      );
    allowedCourseIds = (data ?? []).map((row) => String(row.course_id));
  }
  const dashboard = await loadAnalytics(filters, allowedCourseIds);
  const { count } = await getSupabaseAdmin()
    .from("ai_request_logs")
    .select("id", { count: "exact", head: true })
    .eq("context_mode", "academy_tutor")
    .gte("created_at", `${filters.dateFrom}T00:00:00.000Z`)
    .lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  dashboard.metrics.push(
    privacySafeMetric(
      "tutorUsage",
      "Tutor requests",
      count ?? 0,
      dashboard.cohortSize,
    ),
  );
  return dashboard;
}

export async function getInstructorAcademyAnalytics(
  filters: AcademyAnalyticsFilters,
) {
  const access = await requireAcademyInstructor();
  const assignedCourseIds = access.assignments.map(
    (assignment) => assignment.courseId,
  );
  if (filters.courseId && !assignedCourseIds.includes(filters.courseId))
    throw new AcademyError(
      "ACADEMY_FORBIDDEN",
      "This course is not assigned to you.",
    );
  return {
    assignments: access.assignments,
    dashboard: await loadAnalytics(filters, assignedCourseIds),
    instructorUserId: access.userId,
  };
}
