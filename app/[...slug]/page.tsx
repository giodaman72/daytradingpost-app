import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  isSitePagePath,
  sitePagePaths,
  sitePages,
} from "@/lib/site-pages";

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

      <Footer />
    </main>
  );
}
