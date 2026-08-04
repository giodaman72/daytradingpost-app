import Link from "next/link";
import type { AcademyCatalogFilters } from "@/lib/academy/academyCatalog";
import { academyCatalogQuery } from "@/lib/academy/academyCatalog";
import { localizeHref, type Locale } from "@/lib/i18n/config";

type AcademyPaginationProps = {
  basePath: string;
  currentPage: number;
  filters: AcademyCatalogFilters;
  totalPages: number;
  locale?: Locale;
};

export function AcademyPagination({
  basePath,
  currentPage,
  filters,
  totalPages,
  locale = "en",
}: AcademyPaginationProps) {
  const spanish = locale === "es";
  if (totalPages <= 1) return null;
  const href = (page: number) => {
    const query = academyCatalogQuery(filters, page);
    return localizeHref(`${basePath}${query ? `?${query}` : ""}`, locale);
  };
  return (
    <nav
      className="academy-pagination"
      aria-label={
        spanish ? "Páginas del catálogo de cursos" : "Course catalog pages"
      }
    >
      {currentPage > 1 ? (
        <Link href={href(currentPage - 1)}>
          {spanish ? "Página anterior" : "Previous page"}
        </Link>
      ) : (
        <span aria-disabled="true">
          {spanish ? "Página anterior" : "Previous page"}
        </span>
      )}
      <span>
        {spanish ? "Página" : "Page"} {currentPage} {spanish ? "de" : "of"}{" "}
        {totalPages}
      </span>
      {currentPage < totalPages ? (
        <Link href={href(currentPage + 1)}>
          {spanish ? "Página siguiente" : "Next page"}
        </Link>
      ) : (
        <span aria-disabled="true">
          {spanish ? "Página siguiente" : "Next page"}
        </span>
      )}
    </nav>
  );
}
