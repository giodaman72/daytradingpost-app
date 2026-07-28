import type { AssistantCitation } from "@/types/ai-citation";
import { AssistantCitationItem } from "./AssistantCitationItem";

export function AssistantCitationList({
  citations,
}: {
  citations: AssistantCitation[];
}) {
  if (!citations.length) return null;
  return (
    <details className="assistant-citations">
      <summary>
        {citations.length} DayTradingPost source
        {citations.length === 1 ? "" : "s"}
      </summary>
      <ol>
        {citations.map((citation, index) => (
          <AssistantCitationItem
            citation={citation}
            index={index}
            key={`${citation.sourceType}:${citation.sourceId}`}
          />
        ))}
      </ol>
    </details>
  );
}
