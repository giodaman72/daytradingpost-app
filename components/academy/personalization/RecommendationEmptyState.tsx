import Link from "next/link";

export function RecommendationEmptyState() {
  return (
    <div className="dashboard-panel academy-empty-state">
      <h2>Your next recommendation is being prepared</h2>
      <p>
        Select learning interests or enroll in a published course to receive
        explainable next steps.
      </p>
      <Link href="/academy/courses" className="button">
        Browse all courses
      </Link>
    </div>
  );
}
