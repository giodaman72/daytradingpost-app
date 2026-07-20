import type { AnalyticsEvent } from "@/lib/analytics/analyticsService";
import { createAnalyticsEvent } from "@/lib/analytics/analyticsService";

export const ACADEMY_ANALYTICS_EVENTS = [
  "academy_landing_viewed",
  "academy_catalog_viewed",
  "academy_search_used",
  "academy_filter_applied",
  "academy_course_viewed",
  "academy_course_enrolled",
  "academy_course_started",
  "academy_course_resumed",
  "academy_lesson_started",
  "academy_lesson_progressed",
  "academy_lesson_completed",
  "academy_video_started",
  "academy_video_completed",
  "academy_module_completed",
  "academy_assessment_started",
  "academy_assessment_submitted",
  "academy_assessment_passed",
  "academy_assessment_failed",
  "academy_course_completed",
  "academy_certificate_issued",
  "academy_resource_downloaded",
  "academy_bookmark_created",
  "academy_note_created",
  "academy_learning_path_enrolled",
] as const;

export type AcademyAnalyticsEventName =
  (typeof ACADEMY_ANALYTICS_EVENTS)[number];

export function createAcademyAnalyticsEvent(
  name: AcademyAnalyticsEventName,
  identifiers: {
    assessmentId?: string;
    courseId?: string;
    lessonId?: string;
    moduleId?: string;
  },
): AnalyticsEvent {
  return createAnalyticsEvent(name, identifiers);
}
