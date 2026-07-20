"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AcademyLearningPathEnrollment } from "@/types/academy";
import {
  academyIdempotencyKey,
  academyRequest,
  recordAcademyClientEvent,
} from "../academyClient";

type LearningPathEnrollmentButtonProps = {
  authenticated: boolean;
  enrollment: AcademyLearningPathEnrollment | null;
  learningPathId: string;
  lockReason: string | null;
  nextCourseSlug: string | null;
  pathSlug: string;
};

export function LearningPathEnrollmentButton({
  authenticated,
  enrollment,
  learningPathId,
  lockReason,
  nextCourseSlug,
  pathSlug,
}: LearningPathEnrollmentButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  if (!authenticated)
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/academy/learning-paths/${pathSlug}`)}`}
        className="button academy-primary-action"
      >
        Sign in to enroll
      </Link>
    );
  if (enrollment && nextCourseSlug)
    return (
      <Link
        href={`/academy/courses/${nextCourseSlug}/learn`}
        className="button academy-primary-action"
        onClick={() =>
          recordAcademyClientEvent({
            learningPathId,
            name: "academy_learning_path_resumed",
          })
        }
      >
        {enrollment.status === "completed" ? "Review path" : "Resume path"}
      </Link>
    );
  if (enrollment)
    return (
      <p className="academy-action-note" role="status">
        This path has no currently available next course.
      </p>
    );

  async function enroll() {
    setLoading(true);
    setError(null);
    try {
      await academyRequest<AcademyLearningPathEnrollment>(
        `/api/academy/learning-paths/${pathSlug}/enroll`,
        {
          body: JSON.stringify({
            idempotencyKey: academyIdempotencyKey("path-enrollment"),
          }),
          method: "POST",
        },
      );
      recordAcademyClientEvent({
        learningPathId,
        name: "academy_learning_path_enrolled",
      });
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Learning-path enrollment could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="academy-action-stack">
      <button
        type="button"
        className="button academy-primary-action"
        disabled={loading || Boolean(lockReason)}
        onClick={enroll}
      >
        {loading ? "Enrolling…" : "Enroll in learning path"}
      </button>
      {lockReason ? <p className="academy-action-note">{lockReason}</p> : null}
      {error ? (
        <p className="academy-form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
