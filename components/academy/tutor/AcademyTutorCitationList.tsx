import type { AssistantCitation } from "@/types/ai-citation";
import { AssistantCitationList } from "@/components/assistant/AssistantCitationList";

export function AcademyTutorCitationList({
  citations,
}: {
  citations: AssistantCitation[];
}) {
  return <AssistantCitationList citations={citations} />;
}
