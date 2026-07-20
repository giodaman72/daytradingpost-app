import "server-only";

import { createClient } from "next-sanity";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  isSanityConfigured,
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "@/sanity/env";
import type {
  AcademyAssessment,
  AcademyCourse,
  AcademyCourseDetail,
  AcademyEnrollment,
  AcademyLearningPath,
  AcademyLearningState,
  AcademyLesson,
  AcademyLessonProgress,
  AcademyModuleProgress,
} from "@/types/academy";
import { AcademyError } from "./academyErrors";
import {
  academyAssessmentForGradingQuery,
  academyCourseByLegacySlugQuery,
  academyCourseBySlugQuery,
  academyCoursesQuery,
  academyLearningPathsQuery,
  academyLessonByCourseAndSlugQuery,
  academyLessonForTutorQuery,
  academyLessonStateQuery,
} from "./academyQueries";

let publishedClient: ReturnType<typeof createClient> | null = null;

function getPublishedClient() {
  if (!isSanityConfigured) return null;
  if (!publishedClient) {
    publishedClient = createClient({
      apiVersion: sanityApiVersion,
      dataset: sanityDataset,
      perspective: "published",
      projectId: sanityProjectId,
      token: process.env.SANITY_API_READ_TOKEN?.trim() || undefined,
      useCdn: !process.env.SANITY_API_READ_TOKEN,
    });
  }
  return publishedClient;
}

function requirePublishedClient() {
  const client = getPublishedClient();
  if (!client)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Academy content is not configured.",
    );
  return client;
}

const mapEnrollment = (row: Record<string, unknown>): AcademyEnrollment => ({
  accessSnapshot: (row.access_snapshot as Record<string, unknown>) ?? {},
  completedAt: row.completed_at as string | null,
  courseId: String(row.course_id),
  courseSlug: String(row.course_slug),
  courseVersion: Number(row.course_version),
  enrolledAt: String(row.enrolled_at),
  id: String(row.id),
  lastAccessedAt: row.last_accessed_at as string | null,
  progressPercent: Number(row.progress_percent),
  startedAt: row.started_at as string | null,
  status: row.status as AcademyEnrollment["status"],
  userId: String(row.user_id),
});

export async function listPublishedCourses(limit = 20, offset = 0) {
  return requirePublishedClient().fetch<AcademyCourse[]>(
    academyCoursesQuery,
    { end: offset + limit, start: offset },
    { next: { revalidate: 60, tags: ["sanity", "academy-course"] } },
  );
}

export async function findPublishedCourseBySlug(slug: string) {
  return requirePublishedClient().fetch<AcademyCourseDetail | null>(
    academyCourseBySlugQuery,
    { slug },
    { next: { revalidate: 60, tags: ["sanity", "academy-course", slug] } },
  );
}

export async function findPublishedCourseByLegacySlug(slug: string) {
  return requirePublishedClient().fetch<AcademyCourseDetail | null>(
    academyCourseByLegacySlugQuery,
    { slug },
    {
      next: {
        revalidate: 60,
        tags: ["sanity", "academy-course", `legacy:${slug}`],
      },
    },
  );
}

export async function findPublishedLessonByCourseAndSlug(
  courseId: string,
  lessonSlug: string,
) {
  return requirePublishedClient().fetch<AcademyLesson | null>(
    academyLessonByCourseAndSlugQuery,
    { courseId, lessonSlug },
    {
      next: {
        revalidate: 60,
        tags: ["sanity", "academy-lesson", courseId, lessonSlug],
      },
    },
  );
}

export async function listPublishedLearningPaths(limit = 20, offset = 0) {
  return requirePublishedClient().fetch<AcademyLearningPath[]>(
    academyLearningPathsQuery,
    { end: offset + limit, start: offset },
    { next: { revalidate: 60, tags: ["sanity", "academy-path"] } },
  );
}

export async function findLessonForTutor(lessonId: string) {
  return requirePublishedClient().fetch<Record<string, unknown> | null>(
    academyLessonForTutorQuery,
    { lessonId },
    { next: { revalidate: 60, tags: ["sanity", "academy-lesson", lessonId] } },
  );
}

export async function findPublishedLessonState(lessonId: string) {
  return requirePublishedClient().fetch<{
    _id: string;
    assessmentId: string | null;
    completionMode: string;
    courseId: string;
    durationMinutes: number;
    moduleId: string;
    modulePrerequisiteIds: string[];
    prerequisiteLessonIds: string[];
    requiredForCompletion: boolean;
    version: number;
    video: { durationSeconds?: number } | null;
  } | null>(
    academyLessonStateQuery,
    { lessonId },
    { next: { revalidate: 60, tags: ["sanity", "academy-lesson", lessonId] } },
  );
}

export async function findAssessmentForGrading(assessmentId: string) {
  const token = process.env.SANITY_API_READ_TOKEN?.trim();
  if (!token)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Secure assessment access is not configured.",
    );
  const raw = await requirePublishedClient().fetch<
    | (Omit<AcademyAssessment, "questions"> & {
        questions: Array<
          Omit<AcademyAssessment["questions"][number], "correctAnswer"> & {
            correctOptionIds?: string[];
            numericAnswer?: number;
            numericTolerance?: number;
          }
        >;
      })
    | null
  >(academyAssessmentForGradingQuery, { assessmentId }, { cache: "no-store" });
  if (!raw) return null;
  return {
    ...raw,
    questions: raw.questions.map((question) => {
      let correctAnswer: AcademyAssessment["questions"][number]["correctAnswer"];
      if (question.questionType === "numeric")
        correctAnswer = question.numericAnswer ?? 0;
      else if (question.questionType === "matching")
        correctAnswer = Object.fromEntries(
          question.answers
            .filter((answer) => answer.matchKey)
            .map((answer) => [answer.id, answer.matchKey as string]),
        );
      else if (
        question.questionType === "multiple-choice" ||
        question.questionType === "ordering"
      )
        correctAnswer = question.correctOptionIds ?? [];
      else correctAnswer = question.correctOptionIds?.[0] ?? "";
      return {
        ...question,
        answers: question.answers.map((answer, index) => ({
          ...answer,
          numericTolerance: index === 0 ? question.numericTolerance : undefined,
        })),
        correctAnswer,
      };
    }),
  };
}

export async function listEnrollments(userId: string, limit = 20, offset = 0) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_enrollments")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Enrollments are unavailable.",
    );
  return (data ?? []).map(mapEnrollment);
}

export async function findEnrollment(userId: string, enrollmentId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_enrollments")
    .select("*")
    .eq("id", enrollmentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Enrollment is unavailable.",
    );
  return data ? mapEnrollment(data) : null;
}

export async function findEnrollmentByCourse(userId: string, courseId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .in("status", ["enrolled", "in_progress", "paused", "completed"])
    .maybeSingle();
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Enrollment is unavailable.",
    );
  return data ? mapEnrollment(data) : null;
}

const mapLessonProgress = (
  row: Record<string, unknown>,
): AcademyLessonProgress => ({
  completedAt: row.completed_at as string | null,
  completionMethod:
    row.completion_method as AcademyLessonProgress["completionMethod"],
  contentViewedAt: row.content_viewed_at as string | null,
  enrollmentId: String(row.enrollment_id),
  id: String(row.id),
  lastAccessedAt: row.last_accessed_at as string | null,
  lessonId: String(row.lesson_id),
  lessonVersion: Number(row.lesson_version),
  progressPercent: Number(row.progress_percent),
  status: row.status as AcademyLessonProgress["status"],
  userId: String(row.user_id),
  videoDurationSeconds:
    row.video_duration_seconds === null
      ? null
      : Number(row.video_duration_seconds),
  videoPositionSeconds:
    row.video_position_seconds === null
      ? null
      : Number(row.video_position_seconds),
});

const mapModuleProgress = (
  row: Record<string, unknown>,
): AcademyModuleProgress => ({
  completedAt: row.completed_at as string | null,
  completedRequiredLessonsCount: Number(row.completed_required_lessons_count),
  enrollmentId: String(row.enrollment_id),
  id: String(row.id),
  moduleId: String(row.module_id),
  moduleVersion: Number(row.module_version),
  progressPercent: Number(row.progress_percent),
  requiredLessonsCount: Number(row.required_lessons_count),
  status: row.status as AcademyModuleProgress["status"],
  userId: String(row.user_id),
});

export async function findLearningState(
  userId: string,
  enrollment: AcademyEnrollment,
): Promise<AcademyLearningState> {
  const admin = getSupabaseAdmin();
  const [
    { data: lessonRows, error: lessonError },
    { data: moduleRows, error: moduleError },
  ] = await Promise.all([
    admin
      .from("academy_lesson_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("enrollment_id", enrollment.id)
      .order("created_at", { ascending: true }),
    admin
      .from("academy_module_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("enrollment_id", enrollment.id)
      .order("created_at", { ascending: true }),
  ]);
  if (lessonError || moduleError)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Course progress is unavailable.",
    );
  return {
    enrollment,
    lessonProgress: (lessonRows ?? []).map(mapLessonProgress),
    moduleProgress: (moduleRows ?? []).map(mapModuleProgress),
  };
}

export async function insertEnrollment(input: {
  accessSnapshot: Record<string, unknown>;
  courseId: string;
  courseSlug: string;
  courseVersion: number;
  idempotencyKey: string;
  source: string;
  userId: string;
}) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_enrollments")
    .insert({
      access_snapshot: input.accessSnapshot,
      course_id: input.courseId,
      course_slug: input.courseSlug,
      course_version: input.courseVersion,
      enrollment_source: input.source,
      idempotency_key: input.idempotencyKey,
      user_id: input.userId,
    })
    .select()
    .single();
  if (error?.code === "23505")
    throw new AcademyError(
      "ACADEMY_ALREADY_ENROLLED",
      "You are already enrolled in this course.",
    );
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Could not create enrollment.",
    );
  return mapEnrollment(data);
}

export async function enrollCourseTransactionally(input: {
  accessSnapshot: Record<string, unknown>;
  courseId: string;
  courseSlug: string;
  courseVersion: number;
  idempotencyKey: string;
  lessons: Array<{
    available: boolean;
    id: string;
    module_id: string;
    required_for_completion: boolean;
    version: number;
  }>;
  modules: Array<{
    available: boolean;
    id: string;
    required_for_completion: boolean;
    required_lessons_count: number;
    version: number;
  }>;
  source: string;
  userId: string;
}) {
  const { data, error } = await getSupabaseAdmin().rpc(
    "enroll_academy_course",
    {
      p_access_snapshot: input.accessSnapshot,
      p_course_id: input.courseId,
      p_course_slug: input.courseSlug,
      p_course_version: input.courseVersion,
      p_enrollment_source: input.source,
      p_idempotency_key: input.idempotencyKey,
      p_lessons: input.lessons,
      p_modules: input.modules,
      p_user_id: input.userId,
    },
  );
  if (error?.code === "23505")
    throw new AcademyError(
      "ACADEMY_ALREADY_ENROLLED",
      "You are already enrolled in this course.",
    );
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Could not create enrollment.",
    );
  const enrollment = await findEnrollment(input.userId, String(data));
  if (!enrollment)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Enrollment could not be confirmed.",
    );
  return enrollment;
}

export async function verifyCertificateRecord(verificationCode: string) {
  const { data, error } = await getSupabaseAdmin().rpc(
    "verify_academy_certificate",
    { p_verification_code: verificationCode },
  );
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate verification is unavailable.",
    );
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return null;
  return {
    certificateNumber: String(row.certificate_number),
    completionDate: String(row.completion_date),
    courseTitle: String(row.course_title),
    instructorName: row.instructor_name as string | null,
    issuedAt: String(row.issued_at),
    learnerDisplayName: String(row.learner_display_name),
    status: String(row.status),
    valid: Boolean(row.valid),
  };
}
