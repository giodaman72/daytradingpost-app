import articleData from "./august-articles.json";
import type { Locale } from "@/lib/i18n/config";
import type { Article } from "@/types/article";

const articlesByLocale = articleData as unknown as Record<Locale, Article[]>;

export function getAugustArticles(locale: Locale) {
  return articlesByLocale[locale];
}

export function getAugustArticle(slug: string, locale: Locale) {
  return (
    articlesByLocale[locale].find((article) => article.slug === slug) ?? null
  );
}

export function getAugustArticleSlugs() {
  return Array.from(
    new Set(
      Object.values(articlesByLocale).flatMap((articles) =>
        articles.map((article) => article.slug),
      ),
    ),
  ).map((slug) => ({ slug }));
}
