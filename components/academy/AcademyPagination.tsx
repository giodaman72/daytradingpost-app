import Link from "next/link";
import type { AcademyCatalogFilters } from "@/lib/academy/academyCatalog";
import { academyCatalogQuery } from "@/lib/academy/academyCatalog";

type AcademyPaginationProps = {
  basePath: string;
  currentPage: number;
  filters: AcademyCatalogFilters;
  totalPages: number;
};

export function AcademyPagination({
  basePath,
  currentPage,
  filters,
  totalPages,
}: AcademyPaginationProps) {
  if (totalPages <= 1) return null;
  const href = (page: number) => {
    const query = academyCatalogQuery(filters, page);
    return `${basePath}${query ? `?${query}` : ""}`;
  };
  return (
    <nav className="academy-pagination" aria-label="Course catalog pages">
      {currentPage > 1 ? (
        <Link href={href(currentPage - 1)}>Previous page</Link>
      ) : (
        <span aria-disabled="true">Previous page</span>
      )}
      <span>
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages ? (
        <Link href={href(currentPage + 1)}>Next page</Link>
      ) : (
        <span aria-disabled="true">Next page</span>
      )}
    </nav>
  );
}
