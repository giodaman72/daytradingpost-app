import Link from "next/link";
import type { AnalysisMarket } from "@/lib/analysis-data";

type AnalysisCardProps = {
  market: AnalysisMarket;
};

export function AnalysisCard({ market }: AnalysisCardProps) {
  return (
    <article className={`analysis-market-card accent-${market.accent}`}>
      <div className="analysis-market-card-top">
        <div>
          <span className="analysis-asset-class">{market.assetClass}</span>
          <h3>{market.name}</h3>
          <span className="analysis-symbol">{market.symbol}</span>
        </div>

        <span className={`analysis-bias bias-${market.bias.toLowerCase()}`}>
          {market.bias}
        </span>
      </div>

      <div className="analysis-sample-price">
        <span>Illustrative sample price</span>
        <strong>{market.samplePrice}</strong>
      </div>

      <p>{market.summary}</p>

      <Link href={`/analysis/${market.slug}`} className="card-link">
        Read sample analysis
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
