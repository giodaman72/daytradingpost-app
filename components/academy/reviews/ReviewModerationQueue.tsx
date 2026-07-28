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
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function moderate(
    id: string,
    moderationStatus: "published" | "rejected",
  ) {
    const reason = reasons[id]?.trim();
    if (!reason) {
      setStatus("Enter a moderation reason before taking action.");
      return;
    }
    setPendingId(id);
    try {
      const response = await fetch(
        `/api/admin/academy/reviews/${id}/moderate`,
        {
          body: JSON.stringify({
            reason,
            requestId: crypto.randomUUID(),
            status: moderationStatus,
          }),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        },
      );
      if (response.ok) {
        setReviews((current) => current.filter((review) => review.id !== id));
        setStatus(`Review ${moderationStatus}.`);
      } else setStatus("The moderation action failed.");
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setPendingId(null);
    }
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
            <p>
              Current status: <strong>{review.status}</strong>
              {review.moderationReason
                ? ` · Previous reason: ${review.moderationReason}`
                : ""}
            </p>
            <label>
              Moderation reason
              <input
                maxLength={500}
                onChange={(event) =>
                  setReasons((current) => ({
                    ...current,
                    [review.id]: event.target.value,
                  }))
                }
                value={reasons[review.id] ?? ""}
              />
            </label>
            <div className="academy-review-actions">
              <button
                className="button"
                disabled={pendingId === review.id}
                onClick={() => moderate(review.id, "published")}
                type="button"
              >
                Publish
              </button>
              <button
                disabled={pendingId === review.id}
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
