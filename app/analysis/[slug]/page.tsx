import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/analysis/ArticleLayout";
import {
  getArticleBySlug,
  getArticleSummaryBySlug,
  getArticleSlugs,
  getSanityImageUrl,
} from "@/lib/cms";
import { getMembershipAccess } from "@/lib/payments";
import { getMarketIntelligenceByInstrument } from "@/lib/market/marketIntelligenceService";
import { getQuoteByInstrument } from "@/lib/market-data/marketDataService";
import { languageAlternates, localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

type AnalysisArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return getArticleSlugs();
}

export async function generateMetadata({
  params,
}: AnalysisArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [locale, article] = await Promise.all([
    getRequestLocale(),
    getArticleSummaryBySlug(slug),
  ]);

  if (!article) {
    return {
      title: locale === "es" ? "Análisis no encontrado" : "Analysis not found",
      robots: { index: false, follow: false },
    };
  }

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt;
  const baseUrl = `/analysis/${article.slug}`;
  const url = localizeHref(baseUrl, locale);
  const imageUrl = getSanityImageUrl(article.featuredImage, 1200, 630);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(baseUrl),
    },
    openGraph: {
      title: `${title} | DayTradingPost`,
      description,
      url,
      type: "article",
      publishedTime: article.publishedAt,
      authors: article.author?.name ? [article.author.name] : undefined,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: article.featuredImage?.alt || title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function AnalysisArticlePage({
  params,
}: AnalysisArticlePageProps) {
  const { slug } = await params;
  const [locale, summary] = await Promise.all([
    getRequestLocale(),
    getArticleSummaryBySlug(slug),
  ]);

  if (!summary) {
    notFound();
  }

  const [intelligenceBySlug, quote] = await Promise.all([
    getMarketIntelligenceByInstrument(slug),
    getQuoteByInstrument(summary.instrumentSymbol),
  ]);
  const intelligence =
    intelligenceBySlug ??
    (await getMarketIntelligenceByInstrument(summary.instrumentSymbol));

  if (summary.accessLevel === "premium") {
    const access = await getMembershipAccess();
    if (!access.hasPremiumAccess) {
      return (
        <ArticleLayout
          article={summary}
          intelligence={intelligence}
          marketQuote={quote}
          locked
          locale={locale}
        />
      );
    }
  }

  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <ArticleLayout
      article={article}
      intelligence={intelligence}
      marketQuote={quote}
      locale={locale}
    />
  );
}
