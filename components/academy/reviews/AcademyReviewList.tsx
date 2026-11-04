import type { AcademyCourseReview } from "@/types/academy";
import { ReviewReportButton } from "./ReviewReportButton";
import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";

export function AcademyReviewList({
  locale = "en",
  replies = [],
  reviews,
}: {
  locale?: Locale;
  replies?: Array<{
    createdAt: string;
    id: string;
    replyText: string;
    reviewId: string;
  }>;
  reviews: AcademyCourseReview[];
}) {
  if (!reviews.length) return null;
  const tr = academyLessonText(locale);
  return (
    <ul className="academy-review-list">
      {reviews.map((review) => (
        <li key={review.id}>
          <div aria-label={`${review.rating} ${tr("out of 5 stars")}`}>
            {"★".repeat(review.rating)}
            <span className="sr-only">
              {review.rating} {tr("out of 5")}
            </span>
          </div>
          <h3>{review.title}</h3>
          <p>{review.reviewText}</p>
          <time dateTime={review.createdAt}>
            {new Intl.DateTimeFormat(locale === "es" ? "es-CO" : "en", {
              dateStyle: "medium",
              timeZone: "UTC",
            }).format(new Date(review.createdAt))}
          </time>
          <ReviewReportButton locale={locale} reviewId={review.id} />
          {replies
            .filter((reply) => reply.reviewId === review.id)
            .map((reply) => (
              <blockquote className="academy-instructor-reply" key={reply.id}>
                <strong>{tr("Instructor response")}</strong>
                <p>{reply.replyText}</p>
              </blockquote>
            ))}
        </li>
      ))}
    </ul>
  );
}
