import type { AcademyCourse } from "@/types/academy";
import { AcademyCourseCard } from "./AcademyCourseCard";
import { AcademyEmptyState } from "./AcademyEmptyState";

type AcademyCatalogGridProps = {
  courses: AcademyCourse[];
  filtered?: boolean;
};

export function AcademyCatalogGrid({
  courses,
  filtered = false,
}: AcademyCatalogGridProps) {
  if (!courses.length) return <AcademyEmptyState filtered={filtered} />;
  return (
    <div className="academy-course-grid">
      {courses.map((course) => (
        <AcademyCourseCard course={course} key={course.id} />
      ))}
    </div>
  );
}
