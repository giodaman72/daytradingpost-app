import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";
import Link from "next/link";
import type { AssistantCitation } from "@/types/ai-citation";

export function AssistantCitationItem({
  citation,
  index,
  locale = "en",
}: {
  citation: AssistantCitation;
  index: number;
  locale?: Locale;
}) {
  const tr = academyLessonText(locale);
  return (
    <li>
      <Link
        href={citation.url}
        aria-label={`${tr("Citation")} ${index + 1}: ${citation.title}`}
      >
        <strong>{citation.title}</strong>
        <span>
          {locale === "es"
            ? tr(citation.sourceType)
            : citation.sourceType.replaceAll("_", " ")}
        </span>
      </Link>
      <p>{citation.excerpt}</p>
      <small>
        {citation.timestamp
          ? new Date(citation.timestamp).toLocaleString(
              locale === "es" ? "es-CO" : "en-US",
              {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "America/New_York",
              },
            )
          : tr("Source date unavailable")}
        {citation.delayed ? ` · ${tr("Delayed data")}` : ""}
        {citation.fixture ? ` · ${tr("Development fixture")}` : ""}
        {citation.premium ? ` · ${tr("Premium source")}` : ""}
      </small>
    </li>
  );
}
