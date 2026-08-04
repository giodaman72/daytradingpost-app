import type { AcademyCourse } from "@/types/academy";
import { AcademyCourseCard } from "./AcademyCourseCard";
import { AcademyEmptyState } from "./AcademyEmptyState";
import type { Locale } from "@/lib/i18n/config";

type AcademyCatalogGridProps = {
  courses: AcademyCourse[];
  filtered?: boolean;
  locale?: Locale;
};

export function AcademyCatalogGrid({
  courses,
  filtered = false,
  locale = "en",
}: AcademyCatalogGridProps) {
  if (!courses.length)
    return <AcademyEmptyState filtered={filtered} locale={locale} />;
  return (
    <div className="academy-course-grid">
      {courses.map((course) => (
        <AcademyCourseCard course={course} locale={locale} key={course.id} />
      ))}
    </div>
  );
}
