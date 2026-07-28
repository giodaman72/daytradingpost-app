import "server-only";
import {
  getArticleBySlug,
  getArticleSummaryBySlug,
  getLatestArticles,
} from "@/lib/sanity/client";
import type { RetrievalDocument } from "@/types/ai-context";
import { AssistantError } from "../assistantErrors";

function portableText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value))
    return value.map(portableText).filter(Boolean).join(" ");
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record._type === "image") return "";
    return portableText(record.children ?? record.text ?? "");
  }
  return "";
}

export async function retrieveSanityArticles(
  articleSlug: string | null,
  hasPremiumAccess: boolean,
): Promise<RetrievalDocument[]> {
  if (articleSlug) {
    const summary = await getArticleSummaryBySlug(articleSlug);
    if (!summary) return [];
    if (summary.accessLevel === "premium" && !hasPremiumAccess)
      throw new AssistantError(
        "FORBIDDEN",
        "This article requires an active premium membership.",
        403,
      );
    const article = await getArticleBySlug(articleSlug);
    if (!article) return [];
    return [
      {
        sourceType: "article",
        sourceId: article._id,
        title: article.title,
        content: [
          article.excerpt,
          `Instrument: ${article.instrumentSymbol}. Editorial bias: ${article.marketBias}.`,
          `Support: ${article.supportLevels.join(", ") || "not supplied"}.`,
          `Resistance: ${article.resistanceLevels.join(", ") || "not supplied"}.`,
          `Risk factors: ${article.riskFactors.join("; ") || "not supplied"}.`,
          portableText(article.body),
        ].join("\n"),
        url: `/analysis/${article.slug}`,
        timestamp: article.publishedAt,
        premium: article.accessLevel === "premium",
        delayed: false,
        fixture: false,
        relevance: 100,
      },
    ];
  }
  return (await getLatestArticles(4))
    .filter(
      (article) =>
        article.accessLevel === "free" ||
        (article.accessLevel === "premium" && hasPremiumAccess),
    )
    .map((article, index) => ({
      sourceType: "article" as const,
      sourceId: article._id,
      title: article.title,
      content: `${article.excerpt}\nInstrument: ${article.instrumentSymbol}. Editorial bias: ${article.marketBias}.`,
      url: `/analysis/${article.slug}`,
      timestamp: article.publishedAt,
      premium: article.accessLevel === "premium",
      delayed: false,
      fixture: false,
      relevance: 60 - index,
    }));
}
