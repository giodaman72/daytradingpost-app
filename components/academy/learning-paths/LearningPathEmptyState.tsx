import Link from "next/link";
import { Route } from "lucide-react";

type LearningPathEmptyStateProps = {
  dashboard?: boolean;
};

export function LearningPathEmptyState({
  dashboard = false,
}: LearningPathEmptyStateProps) {
  return (
    <div className="academy-empty-state">
      <Route aria-hidden="true" />
      <h2>
        {dashboard
          ? "No learning paths enrolled yet"
          : "No learning paths match these filters"}
      </h2>
      <p>
        {dashboard
          ? "Choose a guided curriculum to connect courses into one clear progression."
          : "Try a broader search or reset the difficulty, category and access filters."}
      </p>
      <Link
        className="button"
        href={dashboard ? "/academy/learning-paths" : "/academy/learning-paths"}
      >
        Browse learning paths
      </Link>
    </div>
  );
}
