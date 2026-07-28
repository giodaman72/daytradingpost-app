import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  AcademyCourse,
  AcademyLearningRecommendation,
} from "@/types/academy";
import { requireAcademyUser } from "../academyAuthorization";
import {
  findLearningState,
  listEnrollments,
  listPublishedCourses,
} from "../academyRepository";
import { getAcademyCourse } from "../academyService";
import { getUserLearningPathDashboard } from "../learningPaths/learningPathService";
import { findAcademyPreferences } from "./preferencesRepository";
import {
  CONTINUE_LEARNING_PRIORITY,
  rankContinueLearning,
  recommendationReasonText,
  recommendCoursesByRules,
} from "./recommendationRules";

function lessonFor(
  course: AcademyCourse & {
    modules?: Array<{
      lessons?: Array<{
        id: string;
        requiredForCompletion: boolean;
        slug: string;
        status: string;
        title: string;
      }>;
    }>;
  },
  lessonId: string,
) {
  return course.modules
    ?.flatMap((module) => module.lessons ?? [])
    .find((lesson) => lesson.id === lessonId);
}

export async function getAcademyRecommendations() {
  const access = await requireAcademyUser();
  const [courses, enrollments, preferences, pathDashboard] = await Promise.all([
    listPublishedCourses(100, 0),
    listEnrollments(access.userId, 200, 0),
    findAcademyPreferences(access.userId),
    getUserLearningPathDashboard().catch(() => ({
      recommendations: [],
      views: [],
    })),
  ]);
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const completedCourseIds = new Set(
    enrollments
      .filter((enrollment) => enrollment.status === "completed")
      .map((enrollment) => enrollment.courseId),
  );
  const enrolledCourseIds = new Set(
    enrollments.map((enrollment) => enrollment.courseId),
  );
  const activeEnrollments = enrollments.filter((enrollment) =>
    ["enrolled", "in_progress", "paused"].includes(enrollment.status),
  );
  const recentEnrollment = activeEnrollments[0] ?? null;
  const recentCourse = recentEnrollment
    ? (courseById.get(recentEnrollment.courseId) ?? null)
    : null;
  const candidates: AcademyLearningRecommendation[] = [];

  const { data: attempt } = await getSupabaseAdmin()
    .from("academy_assessment_attempts")
    .select("id,enrollment_id,expires_at")
    .eq("user_id", access.userId)
    .eq("status", "started")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (attempt) {
    const enrollment = enrollments.find(
      (item) => item.id === String(attempt.enrollment_id),
    );
    const course = enrollment ? courseById.get(enrollment.courseId) : undefined;
    if (course)
      candidates.push({
        course,
        href: `/academy/assessments/attempts/${attempt.id}`,
        lessonSlug: null,
        lessonTitle: null,
        priority: CONTINUE_LEARNING_PRIORITY.activeAssessment,
        reason: "active-assessment",
        reasonText: recommendationReasonText("active-assessment"),
        type: "assessment",
      });
  }

  for (const enrollment of activeEnrollments.slice(0, 5)) {
    const course = await getAcademyCourse(enrollment.courseSlug).catch(
      () => null,
    );
    if (!course) continue;
    const state = await findLearningState(access.userId, enrollment).catch(
      () => null,
    );
    const progress = state?.lessonProgress.find((item) =>
      ["available", "not_started", "in_progress"].includes(item.status),
    );
    const lesson = progress ? lessonFor(course, progress.lessonId) : null;
    if (lesson?.requiredForCompletion && lesson.status === "published") {
      candidates.push({
        course,
        href: `/academy/courses/${course.slug}/learn/${lesson.slug}`,
        lessonSlug: lesson.slug,
        lessonTitle: lesson.title,
        priority: CONTINUE_LEARNING_PRIORITY.currentRequiredLesson,
        reason: "current-required-lesson",
        reasonText: recommendationReasonText("current-required-lesson"),
        type: "lesson",
      });
      break;
    }
  }

  if (recentCourse)
    candidates.push({
      course: recentCourse,
      href: `/academy/courses/${recentCourse.slug}/learn`,
      lessonSlug: null,
      lessonTitle: null,
      priority: CONTINUE_LEARNING_PRIORITY.recentActiveCourse,
      reason: "continue-course",
      reasonText: recommendationReasonText("continue-course"),
      type: "course",
    });

  const pathNext = pathDashboard.views
    .map((view) => view.progress.nextCourse)
    .find(Boolean);
  const pathCourse = pathNext ? courseById.get(pathNext.id) : null;
  if (pathCourse)
    candidates.push({
      course: pathCourse,
      href: `/academy/courses/${pathCourse.slug}`,
      lessonSlug: null,
      lessonTitle: null,
      priority: CONTINUE_LEARNING_PRIORITY.nextLearningPathCourse,
      reason: "next-in-learning-path",
      reasonText: recommendationReasonText("next-in-learning-path"),
      type: "learning-path",
    });

  const courseRecommendations = recommendCoursesByRules({
    completedCourseIds,
    courses: courses.filter(
      (course) => course.accessLevel === "free" || access.hasPremiumAccess,
    ),
    enrolledCourseIds,
    interests: preferences.interests,
    recentCourse,
    limit: 6,
  });
  const firstRecommended = courseRecommendations[0];
  if (firstRecommended)
    candidates.push({
      course: firstRecommended.course,
      href: `/academy/courses/${firstRecommended.course.slug}`,
      lessonSlug: null,
      lessonTitle: null,
      priority: CONTINUE_LEARNING_PRIORITY.recommendedPublicCourse,
      reason: firstRecommended.reason,
      reasonText: firstRecommended.reasonText,
      type: "recommended",
    });

  return {
    continueLearning: rankContinueLearning(candidates)[0] ?? null,
    courseRecommendations,
    preferences,
  };
}
