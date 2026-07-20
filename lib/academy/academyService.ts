import "server-only";

import { enforceMutationRateLimit } from "@/lib/mutationRateLimit";
import type {
  AcademyCurriculumLesson,
  AcademyLessonView,
} from "@/types/academy";
import {
  canAccessResource,
  canEnrollInCourse,
  canViewCourse,
  canViewLesson,
} from "./academyAccess";
import { requireAcademyUser } from "./academyAuthorization";
import { AcademyError } from "./academyErrors";
import {
  enrollCourseTransactionally,
  findEnrollmentByCourse,
  findLearningState,
  findPublishedCourseByLegacySlug,
  findPublishedCourseBySlug,
  findPublishedLessonByCourseAndSlug,
  listEnrollments,
  listPublishedCourses,
} from "./academyRepository";
import { parseAcademyIdentifier, parseAcademySlug } from "./academyValidation";
import { deriveAcademyAvailability } from "./learningPaths/academyAvailability";

export function listAcademyCourses(limit = 20, offset = 0) {
  return listPublishedCourses(limit, offset);
}

export async function getAcademyCourse(slug: string) {
  const course = await findPublishedCourseBySlug(parseAcademySlug(slug));
  if (!course)
    throw new AcademyError(
      "ACADEMY_COURSE_NOT_FOUND",
      "This Academy course is not available.",
    );
  return course;
}

export async function getAcademyCourseByLegacySlug(slug: string) {
  return findPublishedCourseByLegacySlug(parseAcademySlug(slug));
}

export async function enrollUserInCourse(input: {
  courseSlug: string;
  idempotencyKey: string;
  source?: "self" | "learning_path" | "admin" | "migration";
}) {
  const access = await requireAcademyUser();
  enforceMutationRateLimit(access.userId, "academy-enrollment", 10, 60_000);
  const course = await getAcademyCourse(input.courseSlug);
  const completed = await listEnrollments(access.userId, 100, 0);
  const completedCourseIds = new Set(
    completed
      .filter((enrollment) => enrollment.status === "completed")
      .map((enrollment) => enrollment.courseId),
  );
  const prerequisitesMet = course.prerequisiteCourseIds.every((id) =>
    completedCourseIds.has(id),
  );
  const decision = canEnrollInCourse({
    accessLevel: course.accessLevel,
    authenticated: true,
    hasPremiumAccess: access.hasPremiumAccess,
    prerequisitesMet,
    publishedAt: course.publishedAt,
    status: course.status,
  });
  if (!decision.allowed) {
    const code =
      decision.reason === "premium-required"
        ? "ACADEMY_PREMIUM_REQUIRED"
        : decision.reason === "prerequisite-not-met"
          ? "ACADEMY_PREREQUISITE_NOT_MET"
          : "ACADEMY_FORBIDDEN";
    throw new AcademyError(code, "This course cannot be enrolled in yet.");
  }
  const existing = await findEnrollmentByCourse(access.userId, course.id);
  if (existing)
    throw new AcademyError(
      "ACADEMY_ALREADY_ENROLLED",
      "You are already enrolled in this course.",
    );
  const modules = course.modules
    .filter((module) => module.status === "published")
    .sort((a, b) => a.order - b.order);
  const modulePrerequisites = new Map(
    modules.map((module) => [
      module.id,
      new Set(module.prerequisiteModuleIds ?? []),
    ]),
  );
  const lessons = modules.flatMap((module) =>
    (module.lessons ?? [])
      .filter((lesson) => lesson.status === "published")
      .map((lesson) => ({
        available:
          (modulePrerequisites.get(module.id)?.size ?? 0) === 0 &&
          (lesson.prerequisiteLessonIds?.length ?? 0) === 0,
        id: lesson.id,
        module_id: module.id,
        required_for_completion: lesson.requiredForCompletion,
        version: lesson.version,
      })),
  );
  return enrollCourseTransactionally({
    accessSnapshot: {
      accessLevel: course.accessLevel,
      membershipPlan: access.profile?.membership_plan ?? "free",
      membershipStatus: access.profile?.membership_status ?? "free",
    },
    courseId: course.id,
    courseSlug: course.slug,
    courseVersion: course.version,
    idempotencyKey: input.idempotencyKey,
    lessons,
    modules: modules.map((module) => ({
      available: (modulePrerequisites.get(module.id)?.size ?? 0) === 0,
      id: module.id,
      required_for_completion: module.requiredForCompletion,
      required_lessons_count: (module.lessons ?? []).filter(
        (lesson) =>
          lesson.status === "published" && lesson.requiredForCompletion,
      ).length,
      version: module.version,
    })),
    source: input.source ?? "self",
    userId: access.userId,
  });
}

export async function listUserEnrollments(limit = 20, offset = 0) {
  const access = await requireAcademyUser();
  return listEnrollments(access.userId, limit, offset);
}

export async function getAcademyLearningState(courseSlug: string) {
  const access = await requireAcademyUser();
  const course = await getAcademyCourse(courseSlug);
  const courseAccess = canViewCourse({
    accessLevel: course.accessLevel,
    authenticated: true,
    hasPremiumAccess: access.hasPremiumAccess,
    publishedAt: course.publishedAt,
    status: course.status,
  });
  if (!courseAccess.allowed)
    throw new AcademyError(
      courseAccess.reason === "premium-required"
        ? "ACADEMY_PREMIUM_REQUIRED"
        : "ACADEMY_FORBIDDEN",
      "This course is not available with your current access.",
    );
  const enrollment = await findEnrollmentByCourse(access.userId, course.id);
  if (!enrollment)
    throw new AcademyError(
      "ACADEMY_NOT_ENROLLED",
      "Enroll in this course before opening the curriculum.",
    );
  const learningState = deriveAcademyAvailability(
    course,
    await findLearningState(access.userId, enrollment),
  );
  return {
    access,
    course,
    learningState,
  };
}

export async function getAcademyLessonView(
  courseSlugInput: string,
  lessonSlugInput: string,
): Promise<AcademyLessonView> {
  const courseSlug = parseAcademySlug(courseSlugInput);
  const lessonSlug = parseAcademySlug(lessonSlugInput);
  const { access, course, learningState } =
    await getAcademyLearningState(courseSlug);
  const lesson = await findPublishedLessonByCourseAndSlug(
    course.id,
    lessonSlug,
  );
  if (!lesson)
    throw new AcademyError(
      "ACADEMY_LESSON_NOT_FOUND",
      "This lesson is not available.",
    );
  if (lesson.video?.accessLevel === "premium" && !access.hasPremiumAccess)
    throw new AcademyError(
      "ACADEMY_PREMIUM_REQUIRED",
      "Premium membership is required for this lesson video.",
    );
  lesson.resources = lesson.resources.filter((resource) =>
    canAccessResource(resource.accessLevel, access.hasPremiumAccess),
  );
  const completedLessonIds = new Set(
    learningState.lessonProgress
      .filter((item) => item.status === "completed")
      .map((item) => item.lessonId),
  );
  const courseAccess = canViewCourse({
    accessLevel:
      lesson.accessLevel === "premium" ? "premium" : course.accessLevel,
    authenticated: true,
    hasPremiumAccess: access.hasPremiumAccess,
    publishedAt: course.publishedAt,
    status: course.status,
  });
  const lessonAccess = canViewLesson({
    courseAccess,
    enrolled: true,
    enrollmentStatus: learningState.enrollment.status,
    prerequisitesMet: lesson.prerequisiteLessonIds.every((id) =>
      completedLessonIds.has(id),
    ),
  });
  if (!lessonAccess.allowed) {
    const code =
      lessonAccess.reason === "premium-required"
        ? "ACADEMY_PREMIUM_REQUIRED"
        : lessonAccess.reason === "prerequisite-not-met"
          ? "ACADEMY_PREREQUISITE_NOT_MET"
          : "ACADEMY_LESSON_LOCKED";
    throw new AcademyError(code, "This lesson is currently locked.");
  }
  const progressByLessonId = new Map(
    learningState.lessonProgress.map((item) => [item.lessonId, item]),
  );
  const orderedLessons = course.modules
    .filter((module) => module.status === "published")
    .sort((a, b) => a.order - b.order)
    .flatMap((module) =>
      module.lessons
        .filter((item) => {
          if (item.status !== "published") return false;
          if (item.accessLevel === "premium" && !access.hasPremiumAccess)
            return false;
          return progressByLessonId.get(item.id)?.status !== "locked";
        })
        .sort((a, b) => a.order - b.order),
    );
  const currentIndex = orderedLessons.findIndex(
    (item) => item.id === lesson.id,
  );
  const adjacent = (index: number): AcademyCurriculumLesson | null =>
    index >= 0 && index < orderedLessons.length ? orderedLessons[index] : null;
  return {
    course,
    currentLesson: lesson,
    learningState,
    nextLesson: adjacent(currentIndex + 1),
    previousLesson: adjacent(currentIndex - 1),
  };
}

export async function getAuthorizedAcademyResource(input: {
  courseSlug: string;
  lessonSlug: string;
  resourceId: string;
}) {
  const view = await getAcademyLessonView(input.courseSlug, input.lessonSlug);
  const resourceId = parseAcademyIdentifier(input.resourceId, "resource ID");
  const resource = view.currentLesson.resources.find(
    (item) => item.id === resourceId,
  );
  if (!resource)
    throw new AcademyError(
      "ACADEMY_FORBIDDEN",
      "This lesson resource is unavailable.",
    );
  return {
    ...resource,
    courseId: view.course.id,
    lessonId: view.currentLesson.id,
  };
}

export function getCourseAccessReason(
  input: Parameters<typeof canViewCourse>[0],
) {
  return canViewCourse(input).reason;
}
