"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AcademyAttempt } from "@/types/academy";
import { academyRequest, recordAcademyClientEvent } from "./academyClient";

type AssessmentLauncherProps = {
  assessmentId: string;
  courseId: string;
  label?: string;
  lessonId?: string;
};

export function AssessmentLauncher({
  assessmentId,
  courseId,
  label = "Start assessment",
  lessonId,
}: AssessmentLauncherProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const result = await academyRequest<{ attempt: AcademyAttempt }>(
        `/api/academy/assessments/${assessmentId}/attempts`,
        { body: "{}", method: "POST" },
      );
      recordAcademyClientEvent({
        assessmentId,
        courseId,
        lessonId,
        name: "academy_assessment_started",
      });
      router.push(`/academy/assessments/attempts/${result.attempt.id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The assessment could not be started.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="academy-assessment-launcher">
      <button
        className="button"
        type="button"
        onClick={start}
        disabled={loading}
      >
        {loading ? "Preparing assessment…" : label}
      </button>
      {error ? (
        <p className="academy-form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
