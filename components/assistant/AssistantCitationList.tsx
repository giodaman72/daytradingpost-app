import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";
import type { AssistantCitation } from "@/types/ai-citation";
import { AssistantCitationItem } from "./AssistantCitationItem";

export function AssistantCitationList({
  citations,
  locale = "en",
}: {
  citations: AssistantCitation[];
  locale?: Locale;
}) {
  const tr = academyLessonText(locale);
  if (!citations.length) return null;
  return (
    <details className="assistant-citations">
      <summary>
        {citations.length}{" "}
        {citations.length === 1
          ? tr("DayTradingPost source")
          : tr("DayTradingPost sources")}
      </summary>
      <ol>
        {citations.map((citation, index) => (
          <AssistantCitationItem
            citation={citation}
            index={index}
            locale={locale}
            key={`${citation.sourceType}:${citation.sourceId}`}
          />
        ))}
      </ol>
    </details>
  );
}
