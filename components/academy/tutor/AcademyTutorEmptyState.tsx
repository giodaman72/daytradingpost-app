import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";
export function AcademyTutorEmptyState({
  lessonTitle,
  locale = "en",
}: {
  lessonTitle?: string | null;
  locale?: Locale;
}) {
  const tr = academyLessonText(locale);
  return (
    <div className="assistant-empty">
      <span aria-hidden="true">DTP Tutor</span>
      <h2>
        {lessonTitle
          ? `${tr("Ask about")} “${lessonTitle}”.`
          : tr("Study from authorized Academy sources.")}
      </h2>
      <p>
        {tr(
          "Choose a learning action or write a question. The Tutor runs only after you submit and never receives private notes by default.",
        )}
      </p>
    </div>
  );
}
