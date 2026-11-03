import Link from "next/link";
import { academyLessonText } from "@/lib/academy/academyLessonText";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import type { AcademyTutorMode } from "@/types/ai-assistant";

const ACTIONS: Array<{
  label: string;
  mode: AcademyTutorMode;
  prompt: string;
}> = [
  {
    label: "Explain this lesson",
    mode: "explain_lesson",
    prompt: "Explain the key concepts in this lesson.",
  },
  {
    label: "Simplify this section",
    mode: "simplify_concept",
    prompt: "Simplify the central concept in this lesson.",
  },
  {
    label: "Give me three review questions",
    mode: "practice_questions",
    prompt: "Generate three new, ungraded review questions for this lesson.",
  },
  {
    label: "Explain this chart example",
    mode: "lesson_question",
    prompt: "Explain the published chart example in this lesson.",
  },
  {
    label: "Create a study checklist",
    mode: "study_checklist",
    prompt: "Create a study checklist for this lesson.",
  },
];

export function AcademyTutorLessonActions({
  courseSlug,
  lessonSlug,
  locale = "en",
}: {
  courseSlug: string;
  lessonSlug: string;
  locale?: Locale;
}) {
  const tr = academyLessonText(locale);
  const route = localizeHref(
    `/academy/courses/${encodeURIComponent(courseSlug)}/tutor`,
    locale,
  );
  return (
    <section
      className="academy-tutor-entry"
      aria-labelledby="lesson-tutor-title"
    >
      <div>
        <span className="section-kicker">
          {tr("Optional learning support")}
        </span>
        <h2 id="lesson-tutor-title">
          {tr("Ask the AI Tutor about this lesson")}
        </h2>
        <p>
          {tr(
            "Nothing is sent until you choose an action and submit. Private notes and assessment answers are excluded.",
          )}
        </p>
      </div>
      <div className="academy-tutor-actions">
        {ACTIONS.map((action) => (
          <Link
            className="button button-secondary"
            key={action.mode}
            href={`${route}?lesson=${encodeURIComponent(lessonSlug)}&action=${action.mode}&prompt=${encodeURIComponent(tr(action.prompt))}`}
          >
            {tr(action.label)}
          </Link>
        ))}
      </div>
    </section>
  );
}
