"use client";

import { useState } from "react";
import type { AcademyCourseReview } from "@/types/academy";
import {
  academyIdempotencyKey,
  recordAcademyClientEvent,
} from "../academyClient";

export function AcademyReviewForm({
  courseId,
  courseSlug,
  eligible,
  minimumProgressPercent,
  initial,
}: {
  courseId: string;
  courseSlug: string;
  eligible: boolean;
  minimumProgressPercent: number;
  initial: AcademyCourseReview | null;
}) {
  const [review, setReview] = useState(initial);
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [reviewText, setReviewText] = useState(initial?.reviewText ?? "");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  if (!eligible && !review)
    return (
      <p>
        Enrolled learners can review this course after completing at least{" "}
        {minimumProgressPercent}%.
      </p>
    );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    const editing = Boolean(review);
    try {
      const response = await fetch(
        editing
          ? `/api/academy/reviews/${review?.id}`
          : `/api/academy/courses/${courseSlug}/reviews`,
        {
          body: JSON.stringify({ rating, reviewText, title }),
          headers: { "content-type": "application/json" },
          method: editing ? "PATCH" : "POST",
        },
      );
      const payload = (await response.json()) as {
        data?: AcademyCourseReview;
        message?: string;
      };
      if (response.ok && payload.data) {
        setReview(payload.data);
        setStatus(
          "Review submitted for moderation. It will appear after approval.",
        );
        recordAcademyClientEvent({
          courseId,
          idempotencyKey: academyIdempotencyKey(
            editing ? "review-edited" : "review-created",
          ),
          name: editing ? "academy_review_edited" : "academy_review_created",
        });
      } else setStatus(payload.message ?? "Review could not be saved.");
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!review) return;
    if (!window.confirm("Delete your review? This cannot be undone.")) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/academy/reviews/${review.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setReview(null);
        setRating(5);
        setTitle("");
        setReviewText("");
        setStatus("Your review was removed.");
      } else setStatus("Review could not be removed.");
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="academy-review-form" onSubmit={submit}>
      <h3>{review ? "Edit your review" : "Review this course"}</h3>
      {review ? (
        <p>
          Moderation status: <strong>{review.status}</strong>
        </p>
      ) : null}
      <label>
        Rating
        <select
          aria-label="Course rating"
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} {value === 1 ? "star" : "stars"}
            </option>
          ))}
        </select>
      </label>
      <label>
        Review title
        <input
          maxLength={120}
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label>
        Review
        <textarea
          maxLength={2000}
          required
          rows={5}
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value)}
        />
      </label>
      <div className="academy-review-actions">
        <button className="button" disabled={saving} type="submit">
          {saving ? "Saving…" : review ? "Update review" : "Submit review"}
        </button>
        {review ? (
          <button disabled={saving} onClick={remove} type="button">
            Delete review
          </button>
        ) : null}
      </div>
      <p aria-live="polite" role="status">
        {status}
      </p>
    </form>
  );
}
