import type { Metadata } from "next";
import Link from "next/link";
import { AcademyCatalogFilters } from "@/components/academy/AcademyCatalogFilters";
import { AcademyCatalogGrid } from "@/components/academy/AcademyCatalogGrid";
import { AcademyPagination } from "@/components/academy/AcademyPagination";
import { AcademyViewEvent } from "@/components/academy/AcademyViewEvent";
import {
  filterAndSortAcademyCourses,
  hasAcademyCatalogFilters,
  paginateAcademyCourses,
  parseAcademyCatalogFilters,
} from "@/lib/academy/academyCatalog";
import { listAcademyCourses } from "@/lib/academy/academyService";
import { getCurrentUser } from "@/lib/supabase/auth";
import { languageAlternates, localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const spanish = locale === "es";
  return {
    title: spanish ? "Catálogo de cursos" : "Academy Course Catalog",
    description: spanish
      ? "Busca y filtra cursos de trading por tema, dificultad y nivel de acceso."
      : "Search and filter DayTradingPost trading courses by topic, difficulty and membership access.",
    alternates: {
      canonical: localizeHref("/academy/courses", locale),
      languages: languageAlternates("/academy/courses"),
    },
  };
}

type AcademyCoursesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AcademyCoursesPage({
  searchParams,
}: AcademyCoursesPageProps) {
  const [raw, locale] = await Promise.all([searchParams, getRequestLocale()]);
  const spanish = locale === "es";
  const filters = parseAcademyCatalogFilters(raw);
  const allCourses = await listAcademyCourses(100, 0).catch(() => []);
  const filteredCourses = filterAndSortAcademyCourses(allCourses, filters);
  const currentUser = await getCurrentUser().catch(() => null);
  const page = paginateAcademyCourses(filteredCourses, filters.page);
  const categories = Array.from(
    new Map(
      allCourses
        .filter((course) => course.category)
        .map((course) => [
          course.category!.slug,
          {
            slug: course.category!.slug,
            title: course.category!.title,
          },
        ]),
    ).values(),
  ).toSorted((left, right) => left.title.localeCompare(right.title));
  const instructors = Array.from(
    new Map(
      allCourses
        .filter((course) => course.instructor)
        .map((course) => [
          course.instructor!.slug,
          {
            name: course.instructor!.name,
            slug: course.instructor!.slug,
          },
        ]),
    ).values(),
  ).toSorted((left, right) => left.name.localeCompare(right.name));
  const filtered = hasAcademyCatalogFilters(filters);
  const activeFilterText = [
    filters.query
      ? `${spanish ? "Búsqueda" : "Search"}: ${filters.query}`
      : null,
    filters.difficulty !== "all"
      ? `${spanish ? "Nivel" : "Level"}: ${filters.difficulty}`
      : null,
    filters.access !== "all"
      ? `${spanish ? "Acceso" : "Access"}: ${filters.access}`
      : null,
    filters.category !== "all"
      ? `${spanish ? "Categoría" : "Category"}: ${filters.category}`
      : null,
    filters.instructor !== "all"
      ? `${spanish ? "Instructor" : "Instructor"}: ${filters.instructor}`
      : null,
    filters.duration !== "all"
      ? `${spanish ? "Duración" : "Duration"}: ${filters.duration}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <>
      {currentUser ? (
        <AcademyViewEvent
          name={filtered ? "academy_filter_applied" : "academy_catalog_viewed"}
        />
      ) : null}
      <section className="academy-catalog-hero">
        <div className="container">
          <nav aria-label={spanish ? "Ruta de navegación" : "Breadcrumb"}>
            <Link href={localizeHref("/academy", locale)}>
              {spanish ? "Academia" : "Academy"}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{spanish ? "Cursos" : "Courses"}</span>
          </nav>
          <span className="section-kicker">
            {spanish ? "Catálogo de cursos" : "Course catalog"}
          </span>
          <h1>
            {spanish
              ? "Encuentra la próxima habilidad para tu proceso de trading."
              : "Find the next skill in your trading process."}
          </h1>
          <p>
            {spanish
              ? "Busca cursos publicados por tema, nivel de experiencia y acceso."
              : "Search published courses by subject, experience level and access."}
          </p>
        </div>
      </section>
      <section className="academy-section academy-catalog-section">
        <div className="container">
          <AcademyCatalogFilters
            categories={categories}
            filters={filters}
            instructors={instructors}
            locale={locale}
          />
          {activeFilterText ? (
            <p className="academy-active-filters">
              <strong>
                {spanish ? "Filtros activos:" : "Active filters:"}
              </strong>{" "}
              {activeFilterText}
            </p>
          ) : null}
          <div className="academy-catalog-count" role="status">
            {page.totalResults}{" "}
            {spanish
              ? page.totalResults === 1
                ? "curso"
                : "cursos"
              : page.totalResults === 1
                ? "course"
                : "courses"}
          </div>
          <AcademyCatalogGrid
            courses={page.courses}
            filtered={filtered}
            locale={locale}
          />
          <AcademyPagination
            basePath="/academy/courses"
            currentPage={page.currentPage}
            filters={filters}
            totalPages={page.totalPages}
            locale={locale}
          />
        </div>
      </section>
    </>
  );
}
