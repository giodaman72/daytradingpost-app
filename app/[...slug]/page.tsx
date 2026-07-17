import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { isSitePagePath, sitePagePaths, sitePages } from "@/lib/site-pages";
import { EconomicCard } from "@/components/economic/EconomicCard";
import {
  getRecentEconomicReleases,
  getUpcomingEconomicEvents,
} from "@/lib/economic/economicService";
import { getEventsForMarket } from "@/lib/economic/economicImpact";
import { MarketQuickActions } from "@/components/alerts/MarketQuickActions";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return sitePagePaths.map((path) => ({ slug: path.split("/") }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = slug.join("/");

  if (!isSitePagePath(path)) {
    return {};
  }

  const page = sitePages[path];

  return {
    title: page.kicker,
    description: page.description,
  };
}

export default async function SitePage({ params }: PageProps) {
  const { slug } = await params;
  const path = slug.join("/");

  if (!isSitePagePath(path)) {
    notFound();
  }

  const page = sitePages[path];
  const marketKey = path.startsWith("markets/") ? path.split("/")[1] : null;
  const [upcoming, recent] = marketKey
    ? await Promise.all([
        getUpcomingEconomicEvents(20),
        getRecentEconomicReleases(20),
      ])
    : [null, null];
  const marketEvents =
    marketKey && upcoming
      ? getEventsForMarket(upcoming.events, marketKey).slice(0, 3)
      : [];
  const recentEvents =
    marketKey && recent
      ? getEventsForMarket(recent.events, marketKey).slice(0, 3)
      : [];

  return (
    <main className="inner-page">
      <Header />

      <section className="inner-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />

        <div className="container inner-layout">
          <div className="inner-copy">
            <Link href="/" className="breadcrumb">
              <span aria-hidden="true">←</span>
              DayTradingPost
            </Link>

            <span className="section-kicker">{page.kicker}</span>
            <h1>{page.title}</h1>
            <p>{page.description}</p>

            <div className="inner-actions">
              <Link href={page.actionHref} className="button">
                {page.actionLabel}
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/" className="button button-secondary">
                Back to homepage
              </Link>
            </div>
          </div>

          <aside className="inner-panel" aria-label={`${page.kicker} status`}>
            <div className="inner-status">
              <span className="eyebrow-dot" aria-hidden="true" />
              {page.status}
            </div>

            <h2>What to expect</h2>
            <ul>
              {page.highlights.map((highlight) => (
                <li key={highlight}>
                  <span aria-hidden="true">✓</span>
                  {highlight}
                </li>
              ))}
            </ul>

            <p>
              This page is live so you can navigate the site today. The full
              experience will replace this launch preview as content becomes
              available.
            </p>
          </aside>
        </div>
      </section>

      {marketKey ? (
        <section className="section market-economic-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Market integration</span>
                <h2>Upcoming events for {page.kicker}</h2>
              </div>
              <Link href="/economic-calendar" className="text-link">
                Full calendar →
              </Link>
            </div>
            {marketEvents.length ? (
              <div className="economic-card-grid">
                {marketEvents.map((event) => (
                  <EconomicCard event={event} key={event.id} />
                ))}
              </div>
            ) : (
              <div className="economic-empty" role="status">
                <h3>No relevant verified upcoming events</h3>
                <p>
                  Relevant currency and high-impact releases appear after a
                  production calendar source is connected.
                </p>
              </div>
            )}
            <div className="section-heading economic-recent-heading">
              <div>
                <span className="section-kicker">Recent releases</span>
                <h2>Latest related outcomes</h2>
              </div>
            </div>
            {recentEvents.length ? (
              <div className="economic-card-grid">
                {recentEvents.map((event) => (
                  <EconomicCard event={event} key={event.id} />
                ))}
              </div>
            ) : (
              <p className="economic-market-note">
                No recent verified releases are available.
              </p>
            )}
            <p className="economic-market-note">
              Relevant currency mapping is informational.{" "}
              <Link href="/analysis">Browse related editorial analysis →</Link>
            </p>
            <MarketQuickActions instrument={marketKey} />
          </div>
        </section>
      ) : null}

      <Footer />
    </main>
  );
}
