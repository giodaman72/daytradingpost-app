import Link from "next/link";
import { BookOpenText } from "lucide-react";

type AcademyEmptyStateProps = {
  filtered?: boolean;
};

export function AcademyEmptyState({
  filtered = false,
}: AcademyEmptyStateProps) {
  return (
    <div className="academy-empty-state">
      <BookOpenText size={34} aria-hidden="true" />
      <h2>
        {filtered
          ? "No courses match these filters."
          : "Courses are on the way."}
      </h2>
      <p>
        {filtered
          ? "Try a broader keyword or reset the difficulty and access filters."
          : "Published Academy courses will appear here as soon as the curriculum is ready."}
      </p>
      {filtered ? (
        <Link href="/academy/courses" className="button button-secondary">
          Clear filters
        </Link>
      ) : null}
    </div>
  );
}
