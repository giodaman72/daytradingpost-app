"use client";

import type { Locale } from "@/lib/i18n/config";
import {
  academyErrorText,
  academyLessonText,
} from "@/lib/academy/academyLessonText";
import { useEffect, useMemo, useState } from "react";
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
  locale?: Locale;
  moduleId: string;
  status: AcademyProgressStatus;
};

export function LessonProgressControls({
  assessmentId,
  completionMode,
  courseId,
  enrollmentId,
  lessonId,
  locale = "en",
  moduleId,
  status: initialStatus,
}: LessonProgressControlsProps) {
  const tr = useMemo(() => academyLessonText(locale), [locale]);
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
          academyErrorText(
            requestError,
            tr("Lesson progress could not be started."),
            locale,
          ),
        );
      });
  }, [courseId, enrollmentId, initialStatus, lessonId, locale, moduleId, tr]);

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
        academyErrorText(
          requestError,
          tr("Lesson completion could not be saved."),
          locale,
        ),
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
        <span className="section-kicker">{tr("Lesson progress")}</span>
        <h2 id="lesson-progress-title">
          {status === "completed"
            ? tr("Lesson completed")
            : tr("Keep your progress moving")}
        </h2>
        <p aria-live="polite">
          {status === "completed"
            ? tr("Your course progress has been updated.")
            : completionMode === "video-threshold"
              ? tr(
                  "Watch the required portion of the video. Progress saves automatically.",
                )
              : assessmentRequired
                ? tr("Pass the assessment to complete this lesson.")
                : tr(
                    "Mark this lesson complete when you have finished the material.",
                  )}
        </p>
      </div>
      {status !== "completed" && assessmentRequired && assessmentId ? (
        <AssessmentLauncher
          assessmentId={assessmentId}
          courseId={courseId}
          lessonId={lessonId}
          locale={locale}
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
          {loading ? tr("Saving…") : tr("Mark lesson complete")}
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
