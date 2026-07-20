"use client";

import { useState } from "react";
import type { AcademyCourseReview } from "@/types/academy";

export function ReviewModerationQueue({
  initial,
}: {
  initial: AcademyCourseReview[];
}) {
  const [reviews, setReviews] = useState(initial);
  const [status, setStatus] = useState("");

  async function moderate(
    id: string,
    moderationStatus: "published" | "rejected",
  ) {
    const reason =
      moderationStatus === "published"
        ? "Reviewed against the public community guidelines."
        : "Does not meet the public community guidelines.";
    const response = await fetch(`/api/admin/academy/reviews/${id}/moderate`, {
      body: JSON.stringify({ reason, status: moderationStatus }),
      headers: { "content-type": "application/json" },
      method: "PATCH",
    });
    if (response.ok) {
      setReviews((current) => current.filter((review) => review.id !== id));
      setStatus(`Review ${moderationStatus}.`);
    } else setStatus("The moderation action failed.");
  }

  if (!reviews.length)
    return <p className="academy-empty-state">No reviews await moderation.</p>;
  return (
    <>
      <ul className="academy-review-list moderation">
        {reviews.map((review) => (
          <li key={review.id}>
            <strong>
              {review.rating} / 5 — {review.title}
            </strong>
            <p>{review.reviewText}</p>
            <div className="academy-review-actions">
              <button
                className="button"
                onClick={() => moderate(review.id, "published")}
                type="button"
              >
                Publish
              </button>
              <button
                onClick={() => moderate(review.id, "rejected")}
                type="button"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p aria-live="polite" role="status">
        {status}
      </p>
    </>
  );
}
