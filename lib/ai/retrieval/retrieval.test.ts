import { describe, expect, it } from "vitest";
import type { RetrievalDocument } from "@/types/ai-context";
import { buildAssistantCitations } from "./citationBuilder";
import { rankAndDeduplicateDocuments } from "./contextAssembler";
import { validateAssistantCitations } from "../safety/outputValidator";

const source = (id: string, relevance: number): RetrievalDocument => ({
  sourceType: "article",
  sourceId: id,
  title: id,
  content: `content ${id}`,
  url: `/analysis/${id}`,
  timestamp: "2026-01-01T00:00:00Z",
  premium: false,
  delayed: false,
  fixture: false,
  relevance,
});

describe("assistant retrieval and citations", () => {
  it("ranks and deduplicates retrieved sources", () => {
    const result = rankAndDeduplicateDocuments(
      [source("a", 1), source("a", 5), source("b", 3)],
      1000,
    );
    expect(result.map((item) => item.sourceId)).toEqual(["a", "b"]);
    expect(result[0].relevance).toBe(5);
  });
  it("prevents fabricated citation IDs", () => {
    const documents = [source("real", 1)];
    const citations = [
      ...buildAssistantCitations(documents),
      { ...buildAssistantCitations(documents)[0], sourceId: "fabricated" },
    ];
    expect(validateAssistantCitations(citations, documents)).toHaveLength(1);
  });
});
