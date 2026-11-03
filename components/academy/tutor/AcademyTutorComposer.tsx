"use client";

import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";

import type { FormEvent } from "react";
import {
  ACADEMY_TUTOR_MODES,
  type AcademyTutorMode,
} from "@/types/ai-assistant";

const LABELS: Record<AcademyTutorMode, string> = {
  explain_lesson: "Explain lesson",
  simplify_concept: "Simplify concept",
  summarize_lesson: "Summarize lesson",
  lesson_question: "Lesson question",
  practice_questions: "Practice questions",
  quiz_feedback: "Explain quiz feedback",
  glossary_help: "Glossary help",
  compare_concepts: "Compare concepts",
  study_checklist: "Study checklist",
  next_topic: "Recommend next topic",
};

export function AcademyTutorComposer({
  value,
  tutorMode,
  disabled,
  streaming,
  onValue,
  onTutorMode,
  onSubmit,
  onStop,
  locale = "en",
}: {
  value: string;
  tutorMode: AcademyTutorMode;
  disabled: boolean;
  streaming: boolean;
  onValue: (value: string) => void;
  onTutorMode: (mode: AcademyTutorMode) => void;
  onSubmit: () => void;
  onStop: () => void;
  locale?: Locale;
}) {
  const tr = academyLessonText(locale);
  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }
  return (
    <form className="assistant-composer" onSubmit={submit}>
      <label htmlFor="academy-tutor-mode">{tr("Learning action")}</label>
      <select
        id="academy-tutor-mode"
        value={tutorMode}
        disabled={disabled}
        onChange={(event) =>
          onTutorMode(event.target.value as AcademyTutorMode)
        }
      >
        {ACADEMY_TUTOR_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {tr(LABELS[mode])}
          </option>
        ))}
      </select>
      <label htmlFor="academy-tutor-question">
        {tr("Ask the Academy Tutor")}
      </label>
      <textarea
        id="academy-tutor-question"
        value={value}
        onChange={(event) => onValue(event.target.value)}
        placeholder={tr(
          "Ask about this lesson, a glossary term, or request ungraded practice…",
        )}
        maxLength={4000}
        rows={4}
        disabled={disabled}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      <div>
        <small>
          {value.length.toLocaleString(locale === "es" ? "es-CO" : "en-US")} /{" "}
          {(4000).toLocaleString(locale === "es" ? "es-CO" : "en-US")}
        </small>
        {streaming ? (
          <button
            type="button"
            className="button button-secondary"
            onClick={onStop}
          >
            {tr("Stop generating")}
          </button>
        ) : (
          <button
            type="submit"
            className="button"
            disabled={disabled || !value.trim()}
          >
            {tr("Ask Tutor")}
          </button>
        )}
      </div>
    </form>
  );
}
