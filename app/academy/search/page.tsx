import type { Metadata } from "next";
import { AcademyCatalogFilters } from "@/components/academy/AcademyCatalogFilters";
import { AcademyCatalogGrid } from "@/components/academy/AcademyCatalogGrid";
import { AcademyPagination } from "@/components/academy/AcademyPagination";
import { AcademyViewEvent } from "@/components/academy/AcademyViewEvent";
import {
  filterAndSortAcademyCourses,
  paginateAcademyCourses,
  parseAcademyCatalogFilters,
} from "@/lib/academy/academyCatalog";
import { listAcademyCourses } from "@/lib/academy/academyService";
import { getCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Search Academy Courses",
  description: "Search the DayTradingPost Trading Academy course library.",
  robots: { index: false, follow: true },
};

type AcademySearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AcademySearchPage({
  searchParams,
}: AcademySearchPageProps) {
  const raw = await searchParams;
  const filters = parseAcademyCatalogFilters(raw);
  const allCourses = await listAcademyCourses(100, 0).catch(() => []);
  const page = paginateAcademyCourses(
    filterAndSortAcademyCourses(allCourses, filters),
    filters.page,
  );
  const currentUser = await getCurrentUser().catch(() => null);
  const categories = Array.from(
    new Map(
      allCourses
        .filter((course) => course.category)
        .map((course) => [
          course.category!.slug,
          { slug: course.category!.slug, title: course.category!.title },
        ]),
    ).values(),
  );
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
  );
  return (
    <>
      {currentUser && filters.query ? (
        <AcademyViewEvent name="academy_search_used" />
      ) : null}
      <section className="academy-section academy-search-page">
        <div className="container">
          <span className="section-kicker">Academy search</span>
          <h1>
            {filters.query
              ? `Results for “${filters.query}”`
              : "Search courses"}
          </h1>
          <AcademyCatalogFilters
            action="/academy/search"
            categories={categories}
            filters={filters}
            instructors={instructors}
          />
          <div className="academy-catalog-count" role="status">
            {page.totalResults} {page.totalResults === 1 ? "course" : "courses"}
          </div>
          <AcademyCatalogGrid courses={page.courses} filtered />
          <AcademyPagination
            basePath="/academy/search"
            currentPage={page.currentPage}
            filters={filters}
            totalPages={page.totalPages}
          />
        </div>
      </section>
    </>
  );
}
