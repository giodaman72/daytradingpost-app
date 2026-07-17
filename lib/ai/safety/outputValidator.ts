import type { AssistantCitation } from "@/types/ai-citation";
import type { RetrievalDocument } from "@/types/ai-context";

export function sanitizeAssistantMarkdown(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_match, label: string, url: string) => {
        const safe =
          url.startsWith("/") ||
          /^https:\/\/(?:www\.)?daytradingpost\.com(?:\/|$)/i.test(url);
        return safe ? `[${label}](${url})` : label;
      },
    )
    .trim()
    .slice(0, 20_000);
}

export function validateAssistantCitations(
  citations: AssistantCitation[],
  documents: RetrievalDocument[],
) {
  const allowed = new Set(
    documents.map((document) => `${document.sourceType}:${document.sourceId}`),
  );
  return citations.filter((citation) =>
    allowed.has(`${citation.sourceType}:${citation.sourceId}`),
  );
}
