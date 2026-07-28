import type { RetrievalDocument } from "@/types/ai-context";
import { neutralizeRetrievedContent } from "../safety/promptInjectionDefense";

export function rankAndDeduplicateDocuments(
  documents: RetrievalDocument[],
  maximumCharacters: number,
) {
  const seen = new Set<string>();
  const selected: RetrievalDocument[] = [];
  let size = 0;
  for (const document of [...documents].sort(
    (a, b) =>
      b.relevance - a.relevance ||
      String(b.timestamp).localeCompare(String(a.timestamp)),
  )) {
    const key = `${document.sourceType}:${document.sourceId}`;
    if (seen.has(key)) continue;
    const content = neutralizeRetrievedContent(document.content);
    if (!content || size + content.length > maximumCharacters) continue;
    seen.add(key);
    selected.push({ ...document, content });
    size += content.length;
  }
  return selected;
}

export function assembleRetrievedContext(documents: RetrievalDocument[]) {
  return documents
    .map(
      (document, index) =>
        `[SOURCE ${index + 1}]
type: ${document.sourceType}
id: ${document.sourceId}
title: ${document.title}
timestamp: ${document.timestamp ?? "unavailable"}
premium: ${document.premium}
delayed: ${document.delayed}
development_fixture: ${document.fixture}
content:
${document.content}
[/SOURCE ${index + 1}]`,
    )
    .join("\n\n");
}
