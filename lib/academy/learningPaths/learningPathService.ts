import "server-only";

import { getMembershipAccess } from "@/lib/membership/access";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import type {
  AcademyEnrollment,
  AcademyLearningPath,
  AcademyLearningPathEnrollment,
  AcademyLearningPathView,
} from "@/types/academy";
import { canEnrollInCourse } from "../academyAccess";
import { requireAcademyUser } from "../academyAuthorization";
import { enforceAcademyRateLimit } from "../academyRateLimit";
import { AcademyError } from "../academyErrors";
import {
  deleteLearningPathEnrollment,
  findEnrollmentByCourse,
  findPublishedLearningPathBySlug,
  insertLearningPathEnrollment,
  listEnrollments,
  listLearningPathEnrollments,
  listPublishedLearningPaths,
  updateLearningPathEnrollmentProgress,
} from "../academyRepository";
import { enrollUserInCourse } from "../academyService";
import { normalizePlainText, parseAcademySlug } from "../academyValidation";
import { calculateLearningPathProgress } from "./learningPathProgress";
import {
  recommendLearningPaths,
  type LearningPathRecommendation,
} from "./learningPathRecommendations";

type OptionalAccess = {
  hasPremiumAccess: boolean;
  userId: string | null;
};

async function getOptionalAccess(): Promise<OptionalAccess> {
  if (!isSupabaseAuthConfigured())
    return { hasPremiumAccess: false, userId: null };
  const access = await getMembershipAccess().catch(() => null);
  return {
    hasPremiumAccess: access?.hasPremiumAccess ?? false,
    userId: access?.user?.id ?? null,
  };
}

export function listAcademyLearningPaths(limit = 100, offset = 0) {
  return listPublishedLearningPaths(limit, offset);
}

export async function getAcademyLearningPath(slugInput: string) {
  const path = await findPublishedLearningPathBySlug(
    parseAcademySlug(slugInput),
  );
  if (!path)
    throw new AcademyError(
      "ACADEMY_COURSE_NOT_FOUND",
      "This learning path is not available.",
    );
  return path;
}

function completedCourseIds(enrollments: AcademyEnrollment[]) {
  return new Set(
    enrollments
      .filter((enrollment) => enrollment.status === "completed")
      .map((enrollment) => enrollment.courseId),
  );
}

function completedPathIds(enrollments: AcademyLearningPathEnrollment[]) {
  return new Set(
    enrollments
      .filter((enrollment) => enrollment.status === "completed")
      .map((enrollment) => enrollment.learningPathId),
  );
}

const activePathStatuses = new Set([
  "enrolled",
  "in_progress",
  "paused",
  "completed",
]);

function activePathEnrollment(
  enrollments: AcademyLearningPathEnrollment[],
  learningPathId: string,
) {
  return (
    enrollments.find(
      (item) =>
        item.learningPathId === learningPathId &&
        activePathStatuses.has(item.status),
    ) ?? null
  );
}

function buildLearningPathView(input: {
  access: OptionalAccess;
  courseEnrollments: AcademyEnrollment[];
  enrollment: AcademyLearningPathEnrollment | null;
  path: AcademyLearningPath;
  pathEnrollments: AcademyLearningPathEnrollment[];
}): AcademyLearningPathView {
  const completedCourses = completedCourseIds(input.courseEnrollments);
  const prerequisitesMet = input.path.prerequisitePathIds.every((id) =>
    completedPathIds(input.pathEnrollments).has(id),
  );
  const accessDecision = canEnrollInCourse({
    accessLevel: input.path.accessLevel,
    authenticated: Boolean(input.access.userId),
    hasPremiumAccess: input.access.hasPremiumAccess,
    prerequisitesMet,
    publishedAt: input.path.publishedAt,
    status: input.path.status,
  });
  const progress = calculateLearningPathProgress({
    completedCourseIds: completedCourses,
    courseEnrollments: input.courseEnrollments,
    enrollment: input.enrollment,
    hasPremiumAccess: input.access.hasPremiumAccess,
    path: input.path,
  });
  const reasonByDecision = {
    "authentication-required": "Sign in to enroll in this learning path.",
    "premium-required":
      "Premium membership is required for this learning path.",
    "prerequisite-not-met":
      "Complete the prerequisite learning path before enrolling.",
    "not-published": "This learning path is not currently available.",
  } as const;
  return {
    authenticated: Boolean(input.access.userId),
    canEnroll: accessDecision.allowed && !input.enrollment,
    enrollment: input.enrollment,
    hasPremiumAccess: input.access.hasPremiumAccess,
    lockReason: accessDecision.allowed
      ? null
      : (reasonByDecision[
          accessDecision.reason as keyof typeof reasonByDecision
        ] ?? "This learning path is not available."),
    path: input.path,
    progress,
  };
}

export async function getAcademyLearningPathView(
  slugInput: string,
): Promise<AcademyLearningPathView> {
  const [path, access] = await Promise.all([
    getAcademyLearningPath(slugInput),
    getOptionalAccess(),
  ]);
  const [courseEnrollments, pathEnrollments] = access.userId
    ? await Promise.all([
        listEnrollments(access.userId, 200, 0),
        listLearningPathEnrollments(access.userId, 100, 0),
      ])
    : [[], []];
  const enrollment =
    activePathEnrollment(pathEnrollments, path.id) ??
    pathEnrollments.find((item) => item.learningPathId === path.id) ??
    null;
  const view = buildLearningPathView({
    access,
    courseEnrollments,
    enrollment,
    path,
    pathEnrollments,
  });
  if (
    access.userId &&
    enrollment &&
    ["enrolled", "in_progress", "completed"].includes(enrollment.status)
  ) {
    const completed =
      view.progress.requiredCourses > 0 &&
      view.progress.completedRequiredCourses === view.progress.requiredCourses;
    const targetStatus = completed ? "completed" : "in_progress";
    const needsSynchronization =
      enrollment.status !== targetStatus ||
      enrollment.progressPercent !== view.progress.progressPercent ||
      enrollment.currentCourseId !== (view.progress.nextCourse?.id ?? null);
    if (!needsSynchronization) return view;
    const synchronized = await updateLearningPathEnrollmentProgress({
      completed,
      completedAt: enrollment.completedAt,
      currentCourseId: view.progress.nextCourse?.id ?? null,
      enrollmentId: enrollment.id,
      progressPercent: view.progress.progressPercent,
      startedAt: enrollment.startedAt,
      userId: access.userId,
    }).catch(() => enrollment);
    view.enrollment = synchronized;
  }
  return view;
}

export async function enrollUserInLearningPath(input: {
  idempotencyKey: string;
  pathSlug: string;
}) {
  const access = await requireAcademyUser();
  enforceAcademyRateLimit(access.userId, "path-enrollment", 8);
  const path = await getAcademyLearningPath(input.pathSlug);
  const [courseEnrollments, pathEnrollments] = await Promise.all([
    listEnrollments(access.userId, 200, 0),
    listLearningPathEnrollments(access.userId, 100, 0),
  ]);
  const existing = activePathEnrollment(pathEnrollments, path.id);
  if (existing) return existing;
  const prerequisitesMet = path.prerequisitePathIds.every((id) =>
    completedPathIds(pathEnrollments).has(id),
  );
  const decision = canEnrollInCourse({
    accessLevel: path.accessLevel,
    authenticated: true,
    hasPremiumAccess: access.hasPremiumAccess,
    prerequisitesMet,
    publishedAt: path.publishedAt,
    status: path.status,
  });
  if (!decision.allowed)
    throw new AcademyError(
      decision.reason === "premium-required"
        ? "ACADEMY_PREMIUM_REQUIRED"
        : decision.reason === "prerequisite-not-met"
          ? "ACADEMY_PREREQUISITE_NOT_MET"
          : "ACADEMY_FORBIDDEN",
      "This learning path cannot be enrolled in yet.",
    );

  const initialProgress = calculateLearningPathProgress({
    completedCourseIds: completedCourseIds(courseEnrollments),
    courseEnrollments,
    enrollment: null,
    hasPremiumAccess: access.hasPremiumAccess,
    path,
  });
  const initialCourse = initialProgress.nextCourse;
  const idempotencyKey = normalizePlainText(
    input.idempotencyKey,
    "Idempotency key",
    160,
  );
  const inserted = await insertLearningPathEnrollment({
    currentCourseId: initialCourse?.id ?? null,
    idempotencyKey,
    learningPathId: path.id,
    learningPathVersion: path.version,
    userId: access.userId,
  });

  if (
    initialCourse &&
    !(await findEnrollmentByCourse(access.userId, initialCourse.id))
  ) {
    try {
      await enrollUserInCourse({
        courseSlug: initialCourse.slug,
        idempotencyKey: `${idempotencyKey.slice(0, 153)}:course`,
        source: "learning_path",
      });
    } catch (error) {
      if (!(
        error instanceof AcademyError &&
        error.code === "ACADEMY_ALREADY_ENROLLED"
      )) {
        if (inserted.created)
          await deleteLearningPathEnrollment(
            access.userId,
            inserted.enrollment.id,
          ).catch(() => undefined);
        throw error;
      }
    }
  }
  return inserted.enrollment;
}

export async function getUserLearningPathDashboard(): Promise<{
  recommendations: LearningPathRecommendation[];
  views: AcademyLearningPathView[];
}> {
  const access = await requireAcademyUser();
  const [paths, courseEnrollments, pathEnrollments] = await Promise.all([
    listPublishedLearningPaths(100, 0),
    listEnrollments(access.userId, 200, 0),
    listLearningPathEnrollments(access.userId, 100, 0),
  ]);
  const optionalAccess = {
    hasPremiumAccess: access.hasPremiumAccess,
    userId: access.userId,
  };
  const views = paths
    .map((path) =>
      buildLearningPathView({
        access: optionalAccess,
        courseEnrollments,
        enrollment:
          activePathEnrollment(pathEnrollments, path.id) ??
          pathEnrollments.find((item) => item.learningPathId === path.id) ??
          null,
        path,
        pathEnrollments,
      }),
    )
    .filter((view) => view.enrollment);
  const latestDifficulty = views[0]?.path.difficulty ?? null;
  return {
    recommendations: recommendLearningPaths({
      completedPathIds: completedPathIds(pathEnrollments),
      currentDifficulty: latestDifficulty,
      enrolledPathIds: new Set(
        pathEnrollments.map((item) => item.learningPathId),
      ),
      paths,
    }),
    views,
  };
}
