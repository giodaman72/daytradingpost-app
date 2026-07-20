import "server-only";

import { createClient, defineQuery } from "next-sanity";
import {
  isSanityConfigured,
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "@/sanity/env";
import type {
  AcademyAdminAssessment,
  AcademyAdminCourse,
  AcademyAdminModuleSummary,
} from "@/types/academy-admin";
import type { AcademyContentStatus } from "@/types/academy";
import { AcademyError } from "../academyErrors";
import {
  type AcademyValidationIssue,
  validateCourseForPublication,
} from "./academyContentValidation";

const adminCoursesQuery = defineQuery(/* groq */ `
  *[_type == "academyCourse"] | order(_updatedAt desc) {
    _id,
    title,
    "slug": slug.current,
    status,
    accessLevel,
    difficulty,
    publishedAt,
    "updatedAt": coalesce(updatedAt, _updatedAt),
    version,
    learningObjectives,
    "instructor": instructor->{"id": _id, name},
    "moduleReferenceIds": modules[]._ref,
    modules[]->{
      "id": _id,
      title,
      order,
      requiredForCompletion,
      accessLevel,
      status,
      version,
      "prerequisiteIds": prerequisiteModules[]._ref,
      "lessonReferenceIds": lessons[]._ref,
      lessons[]->{
        "id": _id,
        title,
        order,
        requiredForCompletion,
        completionMode,
        accessLevel,
        status,
        version
      }
    }
  }
`);

const adminAssessmentsQuery = defineQuery(/* groq */ `
  *[_type == "academyAssessment"] | order(_updatedAt desc) {
    _id,
    title,
    status,
    version,
    passingScore,
    maximumAttempts,
    availableFrom,
    availableUntil,
    premium,
    "courseId": course._ref,
    "questionCount": count(questions)
  }
`);

let adminClient: ReturnType<typeof createClient> | null = null;

function getAdminClient() {
  const token = process.env.SANITY_API_READ_TOKEN?.trim();
  if (!isSanityConfigured || !token) return null;
  adminClient ??= createClient({
    apiVersion: sanityApiVersion,
    dataset: sanityDataset,
    perspective: "drafts",
    projectId: sanityProjectId,
    token,
    useCdn: false,
  });
  return adminClient;
}

function requireAdminClient() {
  const client = getAdminClient();
  if (!client)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Academy administration requires SANITY_API_READ_TOKEN.",
    );
  return client;
}

function baseDocumentId(id: string) {
  return id.replace(/^drafts\./, "");
}

function contentStatus(value: unknown): AcademyContentStatus {
  return ["draft", "review", "scheduled", "published", "archived"].includes(
    String(value),
  )
    ? (value as AcademyContentStatus)
    : "draft";
}

function mapModule(row: Record<string, unknown>): AcademyAdminModuleSummary {
  return {
    accessLevel: row.accessLevel === "premium" ? "premium" : "free",
    id: String(row.id),
    lessons: Array.isArray(row.lessons)
      ? row.lessons.map((lesson) => {
          const item = lesson as Record<string, unknown>;
          return {
            accessLevel: item.accessLevel === "premium" ? "premium" : "free",
            completionMode: String(item.completionMode ?? "manual"),
            id: String(item.id),
            order: Number(item.order ?? 0),
            required: Boolean(item.requiredForCompletion),
            status: contentStatus(item.status),
            title: String(item.title ?? "Untitled lesson"),
            version: Number(item.version ?? 1),
          };
        })
      : [],
    order: Number(row.order ?? 0),
    prerequisiteIds: Array.isArray(row.prerequisiteIds)
      ? row.prerequisiteIds.map(String)
      : [],
    required: Boolean(row.requiredForCompletion),
    status: contentStatus(row.status),
    title: String(row.title ?? "Untitled module"),
    version: Number(row.version ?? 1),
  };
}

function mapCourse(row: Record<string, unknown>): AcademyAdminCourse {
  const modules = Array.isArray(row.modules)
    ? row.modules.filter(Boolean).map((module) => mapModule(module))
    : [];
  const moduleReferenceIds = Array.isArray(row.moduleReferenceIds)
    ? row.moduleReferenceIds.map(String)
    : [];
  const issues = validateCourseForPublication({
    learningObjectives: Array.isArray(row.learningObjectives)
      ? row.learningObjectives.map(String)
      : [],
    modules: modules.map((courseModule) => ({
      _id: courseModule.id,
      lessonIds: courseModule.lessons.map((lesson) => lesson.id),
      prerequisiteModuleIds: courseModule.prerequisiteIds,
      status: courseModule.status,
    })),
  } as Parameters<typeof validateCourseForPublication>[0]);
  if (moduleReferenceIds.length !== modules.length)
    issues.push({
      code: "BROKEN_MODULE_REFERENCE",
      message: "One or more module references do not resolve.",
      path: "modules",
      severity: "error",
    });
  for (const courseModule of modules) {
    const rawModule = (row.modules as Record<string, unknown>[]).find(
      (item) => item && String(item.id) === courseModule.id,
    );
    const references = Array.isArray(rawModule?.lessonReferenceIds)
      ? rawModule.lessonReferenceIds
      : [];
    if (references.length !== courseModule.lessons.length)
      issues.push({
        code: "BROKEN_LESSON_REFERENCE",
        message: `${courseModule.title} contains an unresolved lesson reference.`,
        path: `modules.${courseModule.id}.lessons`,
        severity: "error",
      });
  }
  return {
    accessLevel: row.accessLevel === "premium" ? "premium" : "free",
    archived: contentStatus(row.status) === "archived",
    difficulty: ["intermediate", "advanced"].includes(String(row.difficulty))
      ? (row.difficulty as "intermediate" | "advanced")
      : "beginner",
    id: baseDocumentId(String(row._id)),
    instructor:
      row.instructor && typeof row.instructor === "object"
        ? {
            id: baseDocumentId(
              String((row.instructor as Record<string, unknown>).id),
            ),
            name: String(
              (row.instructor as Record<string, unknown>).name ??
                "Unnamed instructor",
            ),
          }
        : null,
    modules: modules.toSorted((a, b) => a.order - b.order),
    publishedAt: row.publishedAt ? String(row.publishedAt) : null,
    slug: String(row.slug ?? ""),
    status: contentStatus(row.status),
    studioDocumentId: String(row._id),
    title: String(row.title ?? "Untitled course"),
    updatedAt: String(row.updatedAt ?? ""),
    validationIssues: issues,
    version: Number(row.version ?? 1),
  };
}

export async function listAdminAcademyCourses() {
  const rows = await requireAdminClient().fetch<Record<string, unknown>[]>(
    adminCoursesQuery,
    {},
    { cache: "no-store" },
  );
  const byId = new Map<string, AcademyAdminCourse>();
  for (const row of rows) {
    const course = mapCourse(row);
    byId.set(course.id, course);
  }
  return [...byId.values()].toSorted((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export async function getAdminAcademyCourse(id: string) {
  return (
    (await listAdminAcademyCourses()).find((course) => course.id === id) ?? null
  );
}

export async function listAdminAcademyAssessments(): Promise<
  AcademyAdminAssessment[]
> {
  const rows = await requireAdminClient().fetch<Record<string, unknown>[]>(
    adminAssessmentsQuery,
    {},
    { cache: "no-store" },
  );
  return rows.map((row) => {
    const issues: string[] = [];
    const questionCount = Number(row.questionCount ?? 0);
    const passingScore = Number(row.passingScore ?? 0);
    const maximumAttempts = Number(row.maximumAttempts ?? 0);
    if (!questionCount) issues.push("No questions are configured.");
    if (passingScore < 1 || passingScore > 100)
      issues.push("Passing score must be between 1 and 100.");
    if (maximumAttempts < 1)
      issues.push("Maximum attempts must be at least one.");
    if (!row.courseId) issues.push("Assessment has no course reference.");
    return {
      availableFrom: row.availableFrom ? String(row.availableFrom) : null,
      availableUntil: row.availableUntil ? String(row.availableUntil) : null,
      courseId: String(row.courseId ?? ""),
      id: baseDocumentId(String(row._id)),
      maximumAttempts,
      passingScore,
      premium: Boolean(row.premium),
      questionCount,
      status: contentStatus(row.status),
      studioDocumentId: String(row._id),
      title: String(row.title ?? "Untitled assessment"),
      validationIssues: issues,
      version: Number(row.version ?? 1),
    };
  });
}

export function academyStudioDocumentUrl(
  schemaType: "academyCourse" | "academyAssessment",
  id: string,
) {
  return `/studio/structure/${schemaType};${encodeURIComponent(baseDocumentId(id))}`;
}

export function filterAdminCourses(
  courses: AcademyAdminCourse[],
  filters: { query?: string; status?: string },
) {
  const query = filters.query?.trim().toLowerCase() ?? "";
  return courses.filter(
    (course) =>
      (!filters.status ||
        filters.status === "all" ||
        course.status === filters.status) &&
      (!query ||
        [course.title, course.slug, course.instructor?.name ?? ""].some(
          (value) => value.toLowerCase().includes(query),
        )),
  );
}

export function summarizeValidation(issues: AcademyValidationIssue[]) {
  return {
    errors: issues.filter((issue) => issue.severity === "error").length,
    warnings: issues.filter((issue) => issue.severity === "warning").length,
  };
}
