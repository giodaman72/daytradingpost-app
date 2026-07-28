"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AcademyEnrollment } from "@/types/academy";
import {
  academyIdempotencyKey,
  academyRequest,
  recordAcademyClientEvent,
} from "./academyClient";

type EnrollmentButtonProps = {
  authenticated: boolean;
  courseId: string;
  courseSlug: string;
  disabledReason?: string | null;
  enrollment: AcademyEnrollment | null;
};

export function EnrollmentButton({
  authenticated,
  courseId,
  courseSlug,
  disabledReason,
  enrollment,
}: EnrollmentButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  if (!authenticated)
    return (
      <Link
        className="button academy-primary-action"
        href={`/login?next=${encodeURIComponent(`/academy/courses/${courseSlug}`)}`}
      >
        Sign in to enroll
      </Link>
    );
  if (enrollment)
    return (
      <Link
        className="button academy-primary-action"
        href={`/academy/courses/${courseSlug}/learn`}
      >
        {enrollment.status === "completed"
          ? "Review course"
          : "Continue learning"}
      </Link>
    );

  async function enroll() {
    setError(null);
    setLoading(true);
    try {
      await academyRequest<AcademyEnrollment>(
        `/api/academy/courses/${courseSlug}/enroll`,
        {
          body: JSON.stringify({
            courseSlug,
            idempotencyKey: academyIdempotencyKey("enrollment"),
          }),
          method: "POST",
        },
      );
      recordAcademyClientEvent({
        courseId,
        name: "academy_course_enrolled",
      });
      router.push(`/academy/courses/${courseSlug}/learn`);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Enrollment could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="academy-action-stack">
      <button
        className="button academy-primary-action"
        type="button"
        onClick={enroll}
        disabled={loading || Boolean(disabledReason)}
      >
        {loading ? "Enrolling…" : "Enroll in course"}
      </button>
      {disabledReason ? (
        <p className="academy-action-note">{disabledReason}</p>
      ) : null}
      {error ? (
        <p className="academy-form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
