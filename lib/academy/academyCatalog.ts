import type { AcademyCourse, AcademyDifficulty } from "@/types/academy";

export const ACADEMY_COURSES_PER_PAGE = 9;

export type AcademyCatalogSort =
  "recommended" | "newest" | "title" | "shortest" | "longest" | "difficulty";

export type AcademyCatalogFilters = {
  access: "all" | "free" | "premium";
  category: string;
  difficulty: "all" | AcademyDifficulty;
  duration: "all" | "under-60" | "60-180" | "over-180";
  instructor: string;
  page: number;
  query: string;
  sort: AcademyCatalogSort;
};

type SearchParams = Record<string, string | string[] | undefined>;

const difficultyValues = new Set([
  "all",
  "beginner",
  "intermediate",
  "advanced",
]);
const accessValues = new Set(["all", "free", "premium"]);
const durationValues = new Set(["all", "under-60", "60-180", "over-180"]);
const sortValues = new Set([
  "recommended",
  "newest",
  "title",
  "shortest",
  "longest",
  "difficulty",
]);
const filterSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function firstValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function enumValue<T extends string>(
  value: string,
  allowed: Set<string>,
  fallback: T,
) {
  return allowed.has(value) ? (value as T) : fallback;
}

function filterSlug(value: string) {
  return value === "all" || filterSlugPattern.test(value) ? value : "all";
}

export function parseAcademyCatalogFilters(
  raw: SearchParams,
): AcademyCatalogFilters {
  const parsedPage = Number.parseInt(firstValue(raw.page), 10);
  return {
    access: enumValue(firstValue(raw.access), accessValues, "all"),
    category: filterSlug(firstValue(raw.category) || "all"),
    difficulty: enumValue(firstValue(raw.difficulty), difficultyValues, "all"),
    duration: enumValue(firstValue(raw.duration), durationValues, "all"),
    instructor: filterSlug(firstValue(raw.instructor) || "all"),
    page:
      Number.isSafeInteger(parsedPage) && parsedPage > 0
        ? Math.min(parsedPage, 1_000)
        : 1,
    query: firstValue(raw.query)
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .slice(0, 120),
    sort: enumValue(firstValue(raw.sort), sortValues, "recommended"),
  };
}

function matchesDuration(
  minutes: number,
  duration: AcademyCatalogFilters["duration"],
) {
  if (duration === "under-60") return minutes < 60;
  if (duration === "60-180") return minutes >= 60 && minutes <= 180;
  if (duration === "over-180") return minutes > 180;
  return true;
}

const difficultyOrder: Record<AcademyDifficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export function filterAndSortAcademyCourses(
  courses: AcademyCourse[],
  filters: AcademyCatalogFilters,
) {
  const query = filters.query.toLowerCase();
  const filtered = courses.filter((course) => {
    if (filters.access !== "all" && course.accessLevel !== filters.access)
      return false;
    if (
      filters.difficulty !== "all" &&
      course.difficulty !== filters.difficulty
    )
      return false;
    if (
      filters.category !== "all" &&
      course.category?.slug !== filters.category
    )
      return false;
    if (
      filters.instructor !== "all" &&
      course.instructor?.slug !== filters.instructor
    )
      return false;
    if (!matchesDuration(course.durationMinutes, filters.duration))
      return false;
    if (!query) return true;
    return [
      course.title,
      course.excerpt,
      course.category?.title ?? "",
      course.instructor?.name ?? "",
      ...course.tags,
      ...course.learningObjectives,
      ...course.targetAudience,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return filtered.toSorted((left, right) => {
    if (filters.sort === "newest")
      return (
        Date.parse(right.publishedAt ?? "") - Date.parse(left.publishedAt ?? "")
      );
    if (filters.sort === "title") return left.title.localeCompare(right.title);
    if (filters.sort === "shortest")
      return left.durationMinutes - right.durationMinutes;
    if (filters.sort === "longest")
      return right.durationMinutes - left.durationMinutes;
    if (filters.sort === "difficulty")
      return (
        difficultyOrder[left.difficulty] - difficultyOrder[right.difficulty] ||
        left.title.localeCompare(right.title)
      );
    return (
      Number(right.featured) - Number(left.featured) ||
      Date.parse(right.publishedAt ?? "") -
        Date.parse(left.publishedAt ?? "") ||
      left.title.localeCompare(right.title)
    );
  });
}

export function paginateAcademyCourses(
  courses: AcademyCourse[],
  page: number,
  perPage = ACADEMY_COURSES_PER_PAGE,
) {
  const totalPages = Math.max(1, Math.ceil(courses.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  return {
    courses: courses.slice(start, start + perPage),
    currentPage,
    totalPages,
    totalResults: courses.length,
  };
}

export function academyCatalogQuery(
  filters: AcademyCatalogFilters,
  page = filters.page,
) {
  const params = new URLSearchParams();
  if (filters.query) params.set("query", filters.query);
  if (filters.difficulty !== "all")
    params.set("difficulty", filters.difficulty);
  if (filters.access !== "all") params.set("access", filters.access);
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.instructor !== "all")
    params.set("instructor", filters.instructor);
  if (filters.duration !== "all") params.set("duration", filters.duration);
  if (filters.sort !== "recommended") params.set("sort", filters.sort);
  if (page > 1) params.set("page", String(page));
  return params.toString();
}

export function hasAcademyCatalogFilters(filters: AcademyCatalogFilters) {
  return Boolean(
    filters.query ||
    filters.access !== "all" ||
    filters.category !== "all" ||
    filters.difficulty !== "all" ||
    filters.duration !== "all" ||
    filters.instructor !== "all" ||
    filters.sort !== "recommended",
  );
}
