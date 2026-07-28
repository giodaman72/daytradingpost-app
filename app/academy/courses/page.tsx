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

export const metadata: Metadata = {
  title: "Academy Course Catalog",
  description:
    "Search and filter DayTradingPost trading courses by topic, difficulty and membership access.",
  alternates: { canonical: "/academy/courses" },
};

type AcademyCoursesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AcademyCoursesPage({
  searchParams,
}: AcademyCoursesPageProps) {
  const raw = await searchParams;
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
    filters.query ? `Search: ${filters.query}` : null,
    filters.difficulty !== "all" ? `Level: ${filters.difficulty}` : null,
    filters.access !== "all" ? `Access: ${filters.access}` : null,
    filters.category !== "all" ? `Category: ${filters.category}` : null,
    filters.instructor !== "all" ? `Instructor: ${filters.instructor}` : null,
    filters.duration !== "all" ? `Duration: ${filters.duration}` : null,
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
          <nav aria-label="Breadcrumb">
            <Link href="/academy">Academy</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Courses</span>
          </nav>
          <span className="section-kicker">Course catalog</span>
          <h1>Find the next skill in your trading process.</h1>
          <p>
            Search published courses by subject, experience level and access.
          </p>
        </div>
      </section>
      <section className="academy-section academy-catalog-section">
        <div className="container">
          <AcademyCatalogFilters
            categories={categories}
            filters={filters}
            instructors={instructors}
          />
          {activeFilterText ? (
            <p className="academy-active-filters">
              <strong>Active filters:</strong> {activeFilterText}
            </p>
          ) : null}
          <div className="academy-catalog-count" role="status">
            {page.totalResults} {page.totalResults === 1 ? "course" : "courses"}
          </div>
          <AcademyCatalogGrid courses={page.courses} filtered={filtered} />
          <AcademyPagination
            basePath="/academy/courses"
            currentPage={page.currentPage}
            filters={filters}
            totalPages={page.totalPages}
          />
        </div>
      </section>
    </>
  );
}
