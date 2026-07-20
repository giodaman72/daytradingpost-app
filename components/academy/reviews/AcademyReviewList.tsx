import type { AcademyCourseReview } from "@/types/academy";

export function AcademyReviewList({
  reviews,
}: {
  reviews: AcademyCourseReview[];
}) {
  if (!reviews.length) return null;
  return (
    <ul className="academy-review-list">
      {reviews.map((review) => (
        <li key={review.id}>
          <div aria-label={`${review.rating} out of 5 stars`}>
            {"★".repeat(review.rating)}
            <span className="sr-only">{review.rating} out of 5</span>
          </div>
          <h3>{review.title}</h3>
          <p>{review.reviewText}</p>
          <time dateTime={review.createdAt}>
            {new Intl.DateTimeFormat("en", {
              dateStyle: "medium",
              timeZone: "UTC",
            }).format(new Date(review.createdAt))}
          </time>
        </li>
      ))}
    </ul>
  );
}
