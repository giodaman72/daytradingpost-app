import Image from "next/image";
import Link from "next/link";
import { getSanityImageUrl } from "@/lib/sanity/image";
import type { ArticleSummary } from "@/types/article";
import { localizeHref, type Locale } from "@/lib/i18n/config";

type ArticleCardProps = {
  article: ArticleSummary;
  locale?: Locale;
};

function formatPublishedDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function ArticleCard({ article, locale = "en" }: ArticleCardProps) {
  const spanish = locale === "es";
  const imageUrl = getSanityImageUrl(article.featuredImage, 960, 600);
  const rawCategory = article.category?.title || "Market analysis";
  const categoryLabels: Record<string, string> = {
    "Market analysis": "Análisis de mercados",
    "Nasdaq Analysis": "Análisis del Nasdaq",
    SilverAnalysis: "Análisis de la plata",
    "Crude Oil Analysis": "Análisis del petróleo crudo",
  };
  const category = spanish
    ? (categoryLabels[rawCategory] ?? rawCategory)
    : rawCategory;
  const biasLabels: Record<string, string> = {
    Bullish: "Alcista",
    Neutral: "Neutral",
    Bearish: "Bajista",
  };

  return (
    <article className="analysis-card analysis-cms-card">
      <div
        className={`analysis-visual bias-${article.marketBias.toLowerCase()}`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.featuredImage?.alt || ""}
            fill
            sizes="(max-width: 800px) 100vw, (max-width: 1200px) 50vw, 380px"
            className="analysis-card-image"
          />
        ) : (
          <div className="visual-lines" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
        )}

        <span>{category}</span>
        <span className="analysis-access-badge">
          {article.accessLevel === "premium"
            ? "Premium"
            : spanish
              ? "Gratis"
              : "Free"}
        </span>
      </div>

      <div className="analysis-content">
        <div className="article-meta">
          <span>{article.instrumentSymbol}</span>
          <span>{formatPublishedDate(article.publishedAt, locale)}</span>
        </div>

        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>

        <div className="analysis-card-footer">
          <span
            className={`analysis-bias bias-${article.marketBias.toLowerCase()}`}
          >
            {spanish
              ? (biasLabels[article.marketBias] ?? article.marketBias)
              : article.marketBias}
          </span>
          <Link
            href={localizeHref(`/analysis/${article.slug}`, locale)}
            className="card-link"
          >
            {article.accessLevel === "premium"
              ? spanish
                ? "Vista previa"
                : "Preview analysis"
              : spanish
                ? "Leer análisis"
                : "Read analysis"}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
