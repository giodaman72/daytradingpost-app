import "server-only";

import { createClient } from "next-sanity";
import { cache } from "react";
import {
  isSanityConfigured,
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "@/sanity/env";
import {
  articleBySlugQuery,
  articleSummaryBySlugQuery,
  articleSlugsQuery,
  articlesQuery,
  latestArticlesQuery,
} from "./queries";
import type { Article, ArticleSummary } from "@/types/article";
import type { Locale } from "@/lib/i18n/config";

let sanityClient: ReturnType<typeof createClient> | null = null;

function getSanityClient() {
  if (!isSanityConfigured) {
    return null;
  }

  if (!sanityClient) {
    const token = process.env.SANITY_API_READ_TOKEN?.trim();

    sanityClient = createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      perspective: "published",
      token: token || undefined,
      useCdn: !token,
    });
  }

  return sanityClient;
}

async function safeFetch<T>(
  query: string,
  fallback: T,
  params: Record<string, unknown> = {},
) {
  const client = getSanityClient();

  if (!client) {
    return fallback;
  }

  try {
    return await client.fetch<T>(query, params, {
      next: { revalidate: 60, tags: ["sanity", "article"] },
    });
  } catch (error) {
    console.error(
      "Sanity content fetch failed:",
      error instanceof Error ? error.message : "Unknown Sanity error",
    );

    return fallback;
  }
}

export function getArticles(locale: Locale = "en") {
  return safeFetch<ArticleSummary[]>(articlesQuery, [], { locale });
}

export function getLatestArticles(limit = 3, locale: Locale = "en") {
  return safeFetch<ArticleSummary[]>(latestArticlesQuery, [], {
    limit,
    locale,
  });
}

export const getArticleBySlug = cache((slug: string, locale: Locale = "en") =>
  safeFetch<Article | null>(articleBySlugQuery, null, { slug, locale }),
);

export const getArticleSummaryBySlug = cache(
  (slug: string, locale: Locale = "en") =>
    safeFetch<ArticleSummary | null>(articleSummaryBySlugQuery, null, {
      slug,
      locale,
    }),
);

export async function getArticleSlugs() {
  const results = await safeFetch<Array<{ slug: string }>>(
    articleSlugsQuery,
    [],
  );

  return results.filter((item) => item.slug);
}
