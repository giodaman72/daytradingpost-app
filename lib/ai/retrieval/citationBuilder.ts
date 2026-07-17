import type { AssistantCitation } from "@/types/ai-citation";
import type { RetrievalDocument } from "@/types/ai-context";

export function buildAssistantCitations(
  documents: RetrievalDocument[],
): AssistantCitation[] {
  return documents.map((document) => ({
    sourceType: document.sourceType,
    sourceId: document.sourceId,
    title: document.title,
    url: document.url,
    timestamp: document.timestamp,
    section: null,
    delayed: document.delayed,
    premium: document.premium,
    fixture: document.fixture,
    excerpt: document.content.replace(/\s+/g, " ").slice(0, 180) || null,
  }));
}
