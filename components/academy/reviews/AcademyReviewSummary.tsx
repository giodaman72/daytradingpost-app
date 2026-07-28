import { Star } from "lucide-react";
import type { AcademyReviewAggregate } from "@/types/academy";

export function AcademyReviewSummary({
  aggregate,
}: {
  aggregate: AcademyReviewAggregate;
}) {
  if (!aggregate.publishedCount)
    return <p>No published learner reviews yet.</p>;
  return (
    <p className="academy-review-summary">
      <Star size={18} aria-hidden="true" />
      <strong>{aggregate.averageRating} out of 5</strong>
      <span>
        from {aggregate.publishedCount} verified learner{" "}
        {aggregate.publishedCount === 1 ? "review" : "reviews"}
      </span>
    </p>
  );
}
