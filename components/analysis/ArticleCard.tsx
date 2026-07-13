import Image from "next/image";
import Link from "next/link";
import { getSanityImageUrl } from "@/lib/sanity/image";
import type { ArticleSummary } from "@/lib/sanity/types";

type ArticleCardProps = {
  article: ArticleSummary;
};

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function ArticleCard({ article }: ArticleCardProps) {
  const imageUrl = getSanityImageUrl(article.featuredImage, 960, 600);
  const category = article.category?.title || "Market analysis";

  return (
    <article className="analysis-card analysis-cms-card">
      <div className={`analysis-visual bias-${article.marketBias.toLowerCase()}`}>
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
          {article.accessLevel === "premium" ? "Premium" : "Free"}
        </span>
      </div>

      <div className="analysis-content">
        <div className="article-meta">
          <span>{article.instrumentSymbol}</span>
          <span>{formatPublishedDate(article.publishedAt)}</span>
        </div>

        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>

        <div className="analysis-card-footer">
          <span className={`analysis-bias bias-${article.marketBias.toLowerCase()}`}>
            {article.marketBias}
          </span>
          <Link href={`/analysis/${article.slug}`} className="card-link">
            Read analysis
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
