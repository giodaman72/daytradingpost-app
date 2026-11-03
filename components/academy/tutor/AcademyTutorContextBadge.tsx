import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";
export function AcademyTutorContextBadge({
  courseTitle,
  lessonTitle,
  locale = "en",
}: {
  courseTitle?: string | null;
  lessonTitle?: string | null;
  locale?: Locale;
}) {
  const tr = academyLessonText(locale);
  return (
    <span className="assistant-context-badge">
      {lessonTitle
        ? `${courseTitle ?? tr("Academy")} · ${lessonTitle}`
        : (courseTitle ?? tr("Academy Tutor"))}
    </span>
  );
}
