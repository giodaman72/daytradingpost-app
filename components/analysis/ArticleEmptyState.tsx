import Link from "next/link";

type ArticleEmptyStateProps = {
  compact?: boolean;
};

export function ArticleEmptyState({ compact = false }: ArticleEmptyStateProps) {
  return (
    <div className={`analysis-empty-state${compact ? " compact" : ""}`}>
      <span className="analysis-empty-icon" aria-hidden="true">
        DTP
      </span>
      <div>
        <span className="section-kicker">Publishing desk</span>
        <h3>New market analysis is being prepared.</h3>
        <p>
          No published articles are available yet. Check back shortly for the
          next DayTradingPost market briefing.
        </p>
        {!compact ? (
          <Link href="/" className="card-link">
            Return home <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
