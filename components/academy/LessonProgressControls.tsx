"use client";

import { useEffect, useState } from "react";
import type {
  AcademyCompletionMode,
  AcademyProgressStatus,
} from "@/types/academy";
import { academyRequest, recordAcademyClientEvent } from "./academyClient";
import { AssessmentLauncher } from "./AssessmentLauncher";

type LessonProgressControlsProps = {
  assessmentId?: string | null;
  completionMode: AcademyCompletionMode;
  courseId: string;
  enrollmentId: string;
  lessonId: string;
  moduleId: string;
  status: AcademyProgressStatus;
};

export function LessonProgressControls({
  assessmentId,
  completionMode,
  courseId,
  enrollmentId,
  lessonId,
  moduleId,
  status: initialStatus,
}: LessonProgressControlsProps) {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialStatus === "completed") return;
    void academyRequest(`/api/academy/lessons/${lessonId}/start`, {
      body: JSON.stringify({ enrollmentId }),
      method: "POST",
    })
      .then(() => {
        setStatus("in_progress");
        recordAcademyClientEvent({
          courseId,
          lessonId,
          moduleId,
          name: "academy_lesson_started",
        });
      })
      .catch((requestError: unknown) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Lesson progress could not be started.",
        );
      });
  }, [courseId, enrollmentId, initialStatus, lessonId, moduleId]);

  async function complete() {
    setLoading(true);
    setError(null);
    try {
      await academyRequest(`/api/academy/lessons/${lessonId}/complete`, {
        body: JSON.stringify({ enrollmentId }),
        method: "POST",
      });
      setStatus("completed");
      recordAcademyClientEvent({
        courseId,
        lessonId,
        moduleId,
        name: "academy_lesson_completed",
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Lesson completion could not be saved.",
      );
    } finally {
      setLoading(false);
    }
  }

  const assessmentRequired = ["quiz-passed", "assessment-passed"].includes(
    completionMode,
  );
  return (
    <section
      className="academy-progress-controls"
      aria-labelledby="lesson-progress-title"
    >
      <div>
        <span className="section-kicker">Lesson progress</span>
        <h2 id="lesson-progress-title">
          {status === "completed"
            ? "Lesson completed"
            : "Keep your progress moving"}
        </h2>
        <p aria-live="polite">
          {status === "completed"
            ? "Your course progress has been updated."
            : completionMode === "video-threshold"
              ? "Watch the required portion of the video. Progress saves automatically."
              : assessmentRequired
                ? "Pass the assessment to complete this lesson."
                : "Mark this lesson complete when you have finished the material."}
        </p>
      </div>
      {status !== "completed" && assessmentRequired && assessmentId ? (
        <AssessmentLauncher
          assessmentId={assessmentId}
          courseId={courseId}
          lessonId={lessonId}
        />
      ) : null}
      {status !== "completed" &&
      !assessmentRequired &&
      completionMode !== "video-threshold" &&
      completionMode !== "external-confirmation" ? (
        <button
          className="button"
          type="button"
          onClick={complete}
          disabled={loading}
        >
          {loading ? "Saving…" : "Mark lesson complete"}
        </button>
      ) : null}
      {error ? (
        <p className="academy-form-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
