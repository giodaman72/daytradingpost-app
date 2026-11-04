"use client";

import { useMemo, useState } from "react";
import type { AcademyCourseReview } from "@/types/academy";
import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";
import {
  academyIdempotencyKey,
  recordAcademyClientEvent,
} from "../academyClient";

const REVIEW_STATUS_ES: Record<string, string> = {
  pending: "pendiente",
  published: "publicada",
  rejected: "rechazada",
  reported: "reportada",
};

export function AcademyReviewForm({
  courseId,
  courseSlug,
  eligible,
  minimumProgressPercent,
  initial,
  locale = "en",
}: {
  courseId: string;
  courseSlug: string;
  eligible: boolean;
  minimumProgressPercent: number;
  initial: AcademyCourseReview | null;
  locale?: Locale;
}) {
  const tr = useMemo(() => academyLessonText(locale), [locale]);
  const spanish = locale === "es";
  const [review, setReview] = useState(initial);
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [reviewText, setReviewText] = useState(initial?.reviewText ?? "");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  if (!eligible && !review)
    return (
      <p>
        {spanish
          ? `Los estudiantes inscritos pueden reseñar este curso después de completar al menos el ${minimumProgressPercent}%.`
          : `Enrolled learners can review this course after completing at least ${minimumProgressPercent}%.`}
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
          tr("Review submitted for moderation. It will appear after approval."),
        );
        recordAcademyClientEvent({
          courseId,
          idempotencyKey: academyIdempotencyKey(
            editing ? "review-edited" : "review-created",
          ),
          name: editing ? "academy_review_edited" : "academy_review_created",
        });
      } else
        setStatus(
          spanish
            ? tr("Review could not be saved.")
            : (payload.message ?? "Review could not be saved."),
        );
    } catch {
      setStatus(tr("Network error. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!review) return;
    if (!window.confirm(tr("Delete your review? This cannot be undone.")))
      return;
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
        setStatus(tr("Your review was removed."));
      } else setStatus(tr("Review could not be removed."));
    } catch {
      setStatus(tr("Network error. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="academy-review-form" onSubmit={submit}>
      <h3>{review ? tr("Edit your review") : tr("Review this course")}</h3>
      {review ? (
        <p>
          {tr("Moderation status:")}{" "}
          <strong>
            {spanish
              ? (REVIEW_STATUS_ES[review.status] ?? review.status)
              : review.status}
          </strong>
        </p>
      ) : null}
      <label>
        {tr("Rating")}
        <select
          aria-label={tr("Course rating")}
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} {value === 1 ? tr("star") : tr("stars")}
            </option>
          ))}
        </select>
      </label>
      <label>
        {tr("Review title")}
        <input
          maxLength={120}
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label>
        {tr("Review")}
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
          {saving
            ? tr("Saving…")
            : review
              ? tr("Update review")
              : tr("Submit review")}
        </button>
        {review ? (
          <button disabled={saving} onClick={remove} type="button">
            {tr("Delete review")}
          </button>
        ) : null}
      </div>
      <p aria-live="polite" role="status">
        {status}
      </p>
    </form>
  );
}
