import Link from "next/link";
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
}: {
  courseSlug: string;
  lessonSlug: string;
}) {
  const route = `/academy/courses/${encodeURIComponent(courseSlug)}/tutor`;
  return (
    <section
      className="academy-tutor-entry"
      aria-labelledby="lesson-tutor-title"
    >
      <div>
        <span className="section-kicker">Optional learning support</span>
        <h2 id="lesson-tutor-title">Ask the AI Tutor about this lesson</h2>
        <p>
          Nothing is sent until you choose an action and submit. Private notes
          and assessment answers are excluded.
        </p>
      </div>
      <div className="academy-tutor-actions">
        {ACTIONS.map((action) => (
          <Link
            className="button button-secondary"
            key={action.mode}
            href={`${route}?lesson=${encodeURIComponent(lessonSlug)}&action=${action.mode}&prompt=${encodeURIComponent(action.prompt)}`}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
