import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/analysis/ArticleLayout";
import {
  getArticleBySlug,
  getArticleSlugs,
} from "@/lib/sanity/client";
import { getSanityImageUrl } from "@/lib/sanity/image";

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
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Analysis not found",
      robots: { index: false, follow: false },
    };
  }

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt;
  const url = `/analysis/${article.slug}`;
  const imageUrl = getSanityImageUrl(article.featuredImage, 1200, 630);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | DayTradingPost`,
      description,
      url,
      type: "article",
      publishedTime: article.publishedAt,
      authors: article.author?.name ? [article.author.name] : undefined,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: article.featuredImage?.alt || title }]
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
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return <ArticleLayout article={article} />;
}
