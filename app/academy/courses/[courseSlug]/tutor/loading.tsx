import { academyLessonText } from "@/lib/academy/academyLessonText";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function CourseTutorLoading() {
  const tr = academyLessonText(await getRequestLocale());
  return (
    <section className="academy-section">
      <div className="container assistant-loading" role="status">
        {tr("Loading course Tutor…")}
      </div>
    </section>
  );
}
