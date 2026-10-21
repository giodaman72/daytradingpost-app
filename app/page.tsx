import { TradingSessionsEarth } from "@/components/home/TradingSessionsEarth";
import { ForexSessionsPanel } from "@/components/home/ForexSessions";
import {
  LatestAnalysisCard,
  type LatestAnalysis,
} from "@/components/home/LatestAnalysisCard";
import { DailyVideoCard } from "@/components/home/DailyVideoCard";
import {
  getArticleBySlug,
  getLatestArticles,
  getLatestDailyVideo,
} from "@/lib/cms";
import { parseYouTubeId } from "@/lib/video/youtube";
import { HomeMarketCharts } from "@/components/home/HomeMarketCharts";
import { MarketTickerTape } from "@/components/home/MarketTickerTape";
import { NewsletterSection } from "@/components/newsletter/NewsletterSection";
import { getChartConfig } from "@/lib/charts/chartConfig";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MarketDataGrid } from "@/components/market-data/MarketDataGrid";
import { getHomepageQuotes } from "@/lib/market-data/marketDataService";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

const HOME_COPY = {
  en: {
    kicker: "Independent market intelligence",
    lines: ["Independent.", "Objective.", "Actionable."],
    description:
      "Daily market analysis, technical levels, and actionable trade ideas to help you trade the markets with clarity and confidence.",
    join: "Join Premium",
    analysis: "View Daily Analysis",
    trusted: "Trusted by traders worldwide",
    features: [
      {
        icon: "▦",
        title: "Daily Market Analysis",
        description:
          "Daily technical analysis and key levels for major markets",
        cta: "View Latest Analysis",
        href: "/analysis",
      },
      {
        icon: "◇",
        title: "Premium Education",
        description:
          "Webinars, courses, and exclusive content to elevate your trading",
        cta: "Explore Education",
        href: "/academy",
      },
      {
        icon: "▥",
        title: "Market Data",
        description: "Real-time quotes and market data across global markets",
        cta: "View Market Data",
        href: "/#markets",
      },
    ],
  },
  es: {
    kicker: "Inteligencia independiente de mercados",
    lines: ["Independiente.", "Objetivo.", "Accionable."],
    description:
      "Análisis diario, niveles técnicos e ideas de trading accionables para operar los mercados con mayor claridad y confianza.",
    join: "Hazte Premium",
    analysis: "Ver análisis diario",
    trusted: "Confianza de traders en todo el mundo",
    features: [
      {
        icon: "▦",
        title: "Análisis diario de mercados",
        description:
          "Análisis técnico diario y niveles clave de los principales mercados",
        cta: "Ver último análisis",
        href: "/analysis",
      },
      {
        icon: "◇",
        title: "Educación Premium",
        description:
          "Webinars, cursos y contenido exclusivo para elevar tu trading",
        cta: "Explorar educación",
        href: "/academy",
      },
      {
        icon: "▥",
        title: "Datos de mercado",
        description: "Cotizaciones y datos de mercado para activos globales",
        cta: "Ver datos de mercado",
        href: "/#markets",
      },
    ],
  },
} as const;

/** Newest analysis with its key levels; null keeps the globe as a fallback. */
async function getLatestAnalysis(
  locale: Locale,
): Promise<LatestAnalysis | null> {
  try {
    const [latest] = await getLatestArticles(1, locale);
    if (!latest) return null;
    const full = await getArticleBySlug(latest.slug, locale).catch(() => null);
    return full ? { ...latest, ...full } : latest;
  } catch {
    return null;
  }
}

export default async function Home() {
  const locale = await getRequestLocale();
  const [quotes, dailyVideo, latestAnalysis] = await Promise.all([
    getHomepageQuotes(),
    getLatestDailyVideo(locale).catch(() => null),
    getLatestAnalysis(locale),
  ]);
  // The daily video leads the hero; the latest analysis fills in until the
  // first video is published, and the globe only if neither can load.
  const showVideo = Boolean(
    dailyVideo && parseYouTubeId(dailyVideo.youtubeUrl),
  );
  const copy = HOME_COPY[locale];
  const tradingViewEnabled = getChartConfig().tradingViewEnabled;
  // Until a first-party quote provider is live, show TradingView's free
  // ticker tape instead of a row of "Data unavailable" cards.
  const hasLiveQuotes = quotes.some((quote) => quote.price !== null);
  const showTickerTape = !hasLiveQuotes && tradingViewEnabled;

  return (
    <main className="reference-home">
      <Header />

      <section className="reference-hero">
        <div className="reference-shell reference-hero-grid">
          <div className="reference-hero-copy">
            <span className="reference-kicker">{copy.kicker}</span>
            <h1>
              {copy.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p>{copy.description}</p>

            <div className="reference-actions">
              <Link
                className="reference-primary-cta"
                href={localizeHref("/premium", locale)}
              >
                <span aria-hidden="true">♛</span>
                {copy.join}
              </Link>
              <Link
                className="reference-secondary-cta"
                href={localizeHref("/analysis", locale)}
              >
                {copy.analysis}
              </Link>
            </div>

            <div className="reference-trust">
              <span aria-hidden="true">✓</span>
              {copy.trusted}
            </div>
          </div>

          {showVideo && dailyVideo ? (
            <div className="reference-hero-side">
              <DailyVideoCard video={dailyVideo} locale={locale} />
              <ForexSessionsPanel locale={locale} />
            </div>
          ) : latestAnalysis ? (
            <div className="reference-hero-side">
              <LatestAnalysisCard article={latestAnalysis} locale={locale} />
              <ForexSessionsPanel locale={locale} />
            </div>
          ) : (
            <TradingSessionsEarth locale={locale} />
          )}
        </div>
      </section>

      <section className="reference-market-strip" id="markets">
        <div className="reference-shell">
          {showTickerTape ? (
            <MarketTickerTape locale={locale} />
          ) : (
            <MarketDataGrid quotes={quotes} compact locale={locale} />
          )}
        </div>
      </section>

      <HomeMarketCharts locale={locale} enabled={tradingViewEnabled} />

      <section className="reference-feature-section">
        <div className="reference-shell reference-feature-grid">
          {copy.features.map((feature) => (
            <article className="reference-feature-card" key={feature.title}>
              <div className="reference-feature-icon" aria-hidden="true">
                {feature.icon}
              </div>
              <div>
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
                <Link href={localizeHref(feature.href, locale)}>
                  {feature.cta} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <NewsletterSection locale={locale} source="homepage" />

      <Footer />
    </main>
  );
}
