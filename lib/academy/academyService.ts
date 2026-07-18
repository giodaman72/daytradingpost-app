import "server-only";

import { enforceMutationRateLimit } from "@/lib/mutationRateLimit";
import type { AcademyCourse } from "@/types/academy";
import { canEnrollInCourse, canViewCourse } from "./academyAccess";
import { requireAcademyUser } from "./academyAuthorization";
import { AcademyError } from "./academyErrors";
import {
  enrollCourseTransactionally,
  findEnrollmentByCourse,
  findPublishedCourseBySlug,
  listEnrollments,
  listPublishedCourses,
} from "./academyRepository";
import { parseAcademySlug } from "./academyValidation";

type CurriculumLesson = {
  _id: string;
  order: number;
  prerequisiteLessonIds?: string[];
  requiredForCompletion: boolean;
  status: string;
  version: number;
};
type CurriculumModule = {
  _id: string;
  lessons?: CurriculumLesson[];
  order: number;
  prerequisiteModuleIds?: string[];
  requiredForCompletion: boolean;
  status: string;
  version: number;
};
type CourseWithCurriculum = AcademyCourse & { modules?: CurriculumModule[] };

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

export async function enrollUserInCourse(input: {
  courseSlug: string;
  idempotencyKey: string;
  source?: "self" | "learning_path" | "admin" | "migration";
}) {
  const access = await requireAcademyUser();
  enforceMutationRateLimit(access.userId, "academy-enrollment", 10, 60_000);
  const course = (await getAcademyCourse(
    input.courseSlug,
  )) as CourseWithCurriculum;
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
  const modules = (course.modules ?? [])
    .filter((module) => module.status === "published")
    .sort((a, b) => a.order - b.order);
  const modulePrerequisites = new Map(
    modules.map((module) => [
      module._id,
      new Set(module.prerequisiteModuleIds ?? []),
    ]),
  );
  const lessons = modules.flatMap((module) =>
    (module.lessons ?? [])
      .filter((lesson) => lesson.status === "published")
      .map((lesson) => ({
        available:
          (modulePrerequisites.get(module._id)?.size ?? 0) === 0 &&
          (lesson.prerequisiteLessonIds?.length ?? 0) === 0,
        id: lesson._id,
        module_id: module._id,
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
      available: (modulePrerequisites.get(module._id)?.size ?? 0) === 0,
      id: module._id,
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

export function getCourseAccessReason(
  input: Parameters<typeof canViewCourse>[0],
) {
  return canViewCourse(input).reason;
}
