import { academyLessonText } from "@/lib/academy/academyLessonText";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";

type AcademyLockedStateProps = {
  courseSlug: string;
  locale?: Locale;
  message: string;
  premium?: boolean;
  title?: string;
};

export function AcademyLockedState({
  courseSlug,
  locale = "en",
  message,
  premium = false,
  title,
}: AcademyLockedStateProps) {
  const tr = academyLessonText(locale);
  return (
    <div className="academy-locked-state">
      <LockKeyhole size={34} aria-hidden="true" />
      <span className="section-kicker">{tr("Protected course content")}</span>
      <h1>{title ?? tr("This lesson is locked.")}</h1>
      <p>{message}</p>
      <div>
        <Link
          href={localizeHref(`/academy/courses/${courseSlug}/learn`, locale)}
          className="button button-secondary"
        >
          {tr("Return to curriculum")}
        </Link>
        {premium ? (
          <Link href={localizeHref("/premium", locale)} className="button">
            {tr("Explore Premium")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
