import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";
export function AcademyTutorDisclaimer({ locale = "en" }: { locale?: Locale }) {
  const tr = academyLessonText(locale);
  return (
    <aside className="assistant-disclaimer">
      <strong>{tr("Educational Tutor with assessment boundaries")}</strong>
      <p>
        {tr(
          "AI explanations may be incomplete or mistaken. The Tutor cannot answer graded assessments, reveal answer keys, issue certificates, give personalized investment advice, or promise trading results. Check every cited lesson and source.",
        )}
      </p>
    </aside>
  );
}
