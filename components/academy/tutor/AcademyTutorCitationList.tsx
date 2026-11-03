import type { Locale } from "@/lib/i18n/config";
import type { AssistantCitation } from "@/types/ai-citation";
import { AssistantCitationList } from "@/components/assistant/AssistantCitationList";

export function AcademyTutorCitationList({
  citations,
  locale = "en",
}: {
  citations: AssistantCitation[];
  locale?: Locale;
}) {
  return <AssistantCitationList citations={citations} locale={locale} />;
}
