import "server-only";

import {
  getArticleBySlug as getSanityArticleBySlug,
  getArticles as getSanityArticles,
  getArticleSlugs as getSanityArticleSlugs,
  getArticleSummaryBySlug as getSanityArticleSummaryBySlug,
} from "@/lib/sanity/client";
import {
  getAugustArticle,
  getAugustArticles,
  getAugustArticleSlugs,
} from "@/lib/content/augustArticles";
import type { Locale } from "@/lib/i18n/config";
import type { ArticleSummary } from "@/types/article";

function mergeBySlug(
  imported: ArticleSummary[],
  sanity: ArticleSummary[],
): ArticleSummary[] {
  const importedSlugs = new Set(imported.map((article) => article.slug));
  return [
    ...imported,
    ...sanity.filter((article) => !importedSlugs.has(article.slug)),
  ].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export async function getArticles(locale: Locale = "en") {
  const sanity = await getSanityArticles(locale);
  return mergeBySlug(getAugustArticles(locale), sanity);
}

export async function getLatestArticles(limit = 3, locale: Locale = "en") {
  return (await getArticles(locale)).slice(0, limit);
}

export async function getArticleBySlug(slug: string, locale: Locale = "en") {
  return (
    getAugustArticle(slug, locale) ??
    (await getSanityArticleBySlug(slug, locale))
  );
}

export async function getArticleSummaryBySlug(
  slug: string,
  locale: Locale = "en",
) {
  return (
    getAugustArticle(slug, locale) ??
    (await getSanityArticleSummaryBySlug(slug, locale))
  );
}

export async function getArticleSlugs() {
  const [sanity, imported] = await Promise.all([
    getSanityArticleSlugs(),
    Promise.resolve(getAugustArticleSlugs()),
  ]);
  return Array.from(
    new Map([...imported, ...sanity].map((item) => [item.slug, item])).values(),
  );
}

export { getSanityImageUrl } from "@/lib/sanity/image";
