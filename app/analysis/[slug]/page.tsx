import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnalysisDetail } from "@/components/analysis/AnalysisDetail";
import { analysisMarkets, getAnalysisMarket } from "@/lib/analysis-data";

type AnalysisPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return analysisMarkets.map((market) => ({ slug: market.slug }));
}

export async function generateMetadata({
  params,
}: AnalysisPageProps): Promise<Metadata> {
  const { slug } = await params;
  const market = getAnalysisMarket(slug);

  if (!market) {
    return {};
  }

  const title = `${market.name} (${market.symbol}) Technical Analysis`;
  const description = `Illustrative ${market.name} technical analysis with sample bias, support, resistance, scenarios, risk factors and trade planning notes.`;
  const url = `/analysis/${market.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | DayTradingPost`,
      description,
      url,
      type: "article",
    },
  };
}

export default async function MarketAnalysisPage({ params }: AnalysisPageProps) {
  const { slug } = await params;
  const market = getAnalysisMarket(slug);

  if (!market) {
    notFound();
  }

  return <AnalysisDetail market={market} />;
}
