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

export function normalizeAcademyTutorSourceMarkers(
  value: string,
  sourceCount: number,
) {
  const normalized = value.replace(
    /\[source\s+(\d+)\]/gi,
    (marker, rawIndex: string) => {
      const index = Number(rawIndex);
      return index >= 1 && index <= sourceCount ? `[Source ${index}]` : "";
    },
  );
  if (sourceCount === 0 || /\[Source \d+\]/.test(normalized))
    return normalized.trim();
  return `${normalized.trim()}\n\nSources consulted: ${Array.from(
    { length: sourceCount },
    (_, index) => `[Source ${index + 1}]`,
  ).join(", ")}`;
}
