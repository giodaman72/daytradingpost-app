import Link from "next/link";
import { ArticleCard } from "@/components/analysis/ArticleCard";
import { ArticleEmptyState } from "@/components/analysis/ArticleEmptyState";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EmptyMarketState } from "@/components/market-intelligence/EmptyMarketState";
import { MarketOutlookCard } from "@/components/market-intelligence/MarketOutlookCard";
import { MarketOutlookGrid } from "@/components/market-intelligence/MarketOutlookGrid";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { EconomicCard } from "@/components/economic/EconomicCard";
import { MarketDataGrid } from "@/components/market-data/MarketDataGrid";
import { getLatestArticles } from "@/lib/cms";
import { getHomepageQuotes } from "@/lib/market-data/marketDataService";
import { getEconomicToday } from "@/lib/economic/economicService";
import { getFeaturedMarketIntelligence } from "@/lib/market/marketIntelligenceService";
import { localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

const HOME_COPY = {
  en: {
    eyebrow: "Independent market intelligence",
    heroLead: "Trade the markets with",
    heroAccent: " greater clarity.",
    heroDescription:
      "Daily technical analysis, professional trading education and actionable market insights designed for active traders.",
    analysisCta: "Read today's analysis",
    academyCta: "Explore the academy",
    trust: [
      ["Daily", "Market coverage"],
      ["Multi-asset", "Trading insights"],
      ["Practical", "Trader education"],
    ],
    outlook: "Today's outlook",
    intelligence: "Market Intelligence",
    editorial: "EDITORIAL",
    marketData: "Market data",
    quoteSnapshot: "Provider quote snapshot",
    quoteNote: "Prices are informational and may be delayed or simulated.",
    editorialIntelligence: "Editorial intelligence",
    structuredOutlooks: "Structured market outlooks",
    economicIntelligence: "Economic intelligence",
    highImpact: "Today's high-impact events",
    openCalendar: "Open full calendar",
    noEvents: "No verified high-impact events today",
    noEventsDescription:
      "Check the complete calendar for medium-impact releases and upcoming events.",
    marketAnalysis: "Market analysis",
    sessionInsights: "Insights for today's trading session",
    viewAnalysis: "View all analysis",
    academy: "Trading academy",
    academyTitle: "Develop the skills behind better trading decisions.",
    academyDescription:
      "Learn through structured, practical lessons created for traders who want to understand the market—not merely follow signals.",
    startLearning: "Start learning",
    premiumTitle: "Your complete daily trading intelligence package.",
    premiumDescription:
      "Access premium market briefings, detailed trade scenarios, educational webinars and member-only resources.",
    benefits: [
      "Daily technical outlooks",
      "Key support and resistance levels",
      "Live educational webinars",
      "Premium academy content",
    ],
    founding: "Founding membership",
    plans: "2 plans",
    cadence: "monthly or annual",
    checkout:
      "Final pricing, currency, and payment terms are shown securely during checkout.",
    joinPremium: "Join Premium",
    revolut: "Revolut-secured checkout",
    brief: "The Daily Market Brief",
    newsletterTitle: "Start every trading day better informed.",
    newsletterDescription:
      "Get important market developments, technical levels and upcoming economic events delivered to your inbox.",
    topics: [
      [
        "01",
        "Market Foundations",
        "Learn chart types, market structure, order execution and essential trading terminology.",
      ],
      [
        "02",
        "Technical Analysis",
        "Understand trends, support, resistance, momentum, volatility and price patterns.",
      ],
      [
        "03",
        "Risk Management",
        "Build a repeatable framework for position sizing, trade management and capital protection.",
      ],
    ],
  },
  es: {
    eyebrow: "Inteligencia independiente de mercados",
    heroLead: "Opera en los mercados con",
    heroAccent: " mayor claridad.",
    heroDescription:
      "Análisis técnico diario, formación profesional en trading e información práctica de mercados para traders activos.",
    analysisCta: "Lee el análisis de hoy",
    academyCta: "Explora la academia",
    trust: [
      ["Diaria", "Cobertura de mercados"],
      ["Multiactivo", "Perspectivas de trading"],
      ["Práctica", "Formación para traders"],
    ],
    outlook: "Perspectiva de hoy",
    intelligence: "Inteligencia de mercados",
    editorial: "EDITORIAL",
    marketData: "Datos de mercado",
    quoteSnapshot: "Resumen de cotizaciones de activos variables.",
    quoteNote:
      "Los precios son informativos y pueden estar retrasados o simulados.",
    editorialIntelligence: "Inteligencia editorial",
    structuredOutlooks: "Perspectivas estructuradas de mercado",
    economicIntelligence: "Inteligencia económica",
    highImpact: "Eventos de alto impacto de hoy",
    openCalendar: "Abrir el calendario completo",
    noEvents: "No hay eventos verificados de alto impacto para hoy",
    noEventsDescription:
      "Consulta el calendario completo para ver publicaciones de impacto medio y próximos eventos.",
    marketAnalysis: "Análisis de mercados",
    sessionInsights: "Ideas para la sesión de trading de hoy",
    viewAnalysis: "Ver todos los análisis",
    academy: "Academia de trading",
    academyTitle:
      "Desarrolla las habilidades para tomar mejores decisiones de trading.",
    academyDescription:
      "Aprende con lecciones prácticas y estructuradas para traders que quieren comprender el mercado, no limitarse a seguir señales.",
    startLearning: "Empezar a aprender",
    premiumTitle: "Tu paquete completo de inteligencia diaria de trading.",
    premiumDescription:
      "Accede a informes premium, escenarios detallados, webinars educativos y recursos exclusivos para miembros.",
    benefits: [
      "Perspectivas técnicas diarias",
      "Niveles clave de soporte y resistencia",
      "Webinars educativos en directo",
      "Contenido premium de la academia",
    ],
    founding: "Membresía fundadora",
    plans: "2 planes",
    cadence: "mensual o anual",
    checkout:
      "El precio final, la divisa y las condiciones de pago se muestran de forma segura durante el proceso de compra.",
    joinPremium: "Hazte Premium",
    revolut: "Pago seguro con Revolut",
    brief: "El informe diario de mercados",
    newsletterTitle: "Empieza cada jornada de trading mejor informado.",
    newsletterDescription:
      "Recibe en tu correo los principales movimientos del mercado, niveles técnicos y próximos eventos económicos.",
    topics: [
      [
        "01",
        "Fundamentos de mercado",
        "Aprende tipos de gráficos, estructura de mercado, ejecución de órdenes y terminología esencial.",
      ],
      [
        "02",
        "Análisis técnico",
        "Comprende tendencias, soporte, resistencia, impulso, volatilidad y patrones de precio.",
      ],
      [
        "03",
        "Gestión del riesgo",
        "Crea un marco repetible para dimensionar posiciones, gestionar operaciones y proteger el capital.",
      ],
    ],
  },
} as const;

export default async function Home() {
  const [locale, analyses, outlooks, quotes, economicToday] = await Promise.all(
    [
      getRequestLocale(),
      getLatestArticles(3),
      getFeaturedMarketIntelligence(),
      getHomepageQuotes(),
      getEconomicToday(),
    ],
  );
  const copy = HOME_COPY[locale];

  return (
    <main>
      <Header />

      <section className="section" id="premium">
        <div className="container">
          <div className="premium-card">
            <div className="premium-copy">
              <span className="section-kicker">DayTradingPost Premium</span>

              <h2>{copy.premiumTitle}</h2>

              <p>{copy.premiumDescription}</p>

              <ul className="premium-list">
                {copy.benefits.map((benefit) => (
                  <li key={benefit}>
                    <span>✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pricing-card">
              <span className="pricing-label">{copy.founding}</span>

              <div className="price">
                <strong>{copy.plans}</strong>
                <span>{copy.cadence}</span>
              </div>

              <p>{copy.checkout}</p>

              <Link
                href={localizeHref("/premium", locale)}
                className="button button-full"
              >
                {copy.joinPremium}
                <span aria-hidden="true">→</span>
              </Link>

              <span className="pricing-note">{copy.revolut}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />

        <div className="container hero-content">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              {copy.eyebrow}
            </div>

            <h1>
              {copy.heroLead}
              <span>{copy.heroAccent}</span>
            </h1>

            <p className="hero-description">{copy.heroDescription}</p>

            <div className="hero-actions">
              <Link href="#analysis" className="button">
                {copy.analysisCta}
                <span aria-hidden="true">→</span>
              </Link>

              <Link href="#academy" className="button button-secondary">
                {copy.academyCta}
              </Link>
            </div>

            <div className="trust-row">
              {copy.trust.map(([title, description]) => (
                <div key={title}>
                  <strong>{title}</strong>
                  <span>{description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-header">
              <div>
                <span className="panel-label">{copy.outlook}</span>
                <h2>{copy.intelligence}</h2>
              </div>

              <span className="editorial-indicator">{copy.editorial}</span>
            </div>
            {outlooks[0] ? (
              <MarketOutlookCard outlook={outlooks[0]} />
            ) : (
              <EmptyMarketState locale={locale} />
            )}
          </div>
        </div>
      </section>

      <section className="market-strip" id="markets">
        <div className="container">
          <div className="market-data-heading">
            <div>
              <span className="section-kicker">{copy.marketData}</span>
              <h2>{copy.quoteSnapshot}</h2>
            </div>
            <p>{copy.quoteNote}</p>
          </div>
          <MarketDataGrid quotes={quotes} compact locale={locale} />
        </div>
      </section>

      <section className="section editorial-outlooks-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                {copy.editorialIntelligence}
              </span>
              <h2>{copy.structuredOutlooks}</h2>
            </div>
          </div>
          <MarketOutlookGrid outlooks={outlooks} locale={locale} />
        </div>
      </section>

      <section
        className="section section-muted homepage-economic"
        id="economic-calendar"
      >
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                {copy.economicIntelligence}
              </span>
              <h2>{copy.highImpact}</h2>
            </div>
            <Link
              href={localizeHref("/economic-calendar", locale)}
              className="text-link"
            >
              {copy.openCalendar} <span aria-hidden="true">→</span>
            </Link>
          </div>
          {economicToday.events.filter((event) => event.impact === "high")
            .length ? (
            <div className="economic-card-grid">
              {economicToday.events
                .filter((event) => event.impact === "high")
                .slice(0, 3)
                .map((event) => (
                  <EconomicCard
                    event={event}
                    showCountdown
                    locale={locale}
                    key={event.id}
                  />
                ))}
            </div>
          ) : (
            <div className="economic-empty" role="status">
              <h3>{copy.noEvents}</h3>
              <p>{copy.noEventsDescription}</p>
            </div>
          )}
        </div>
      </section>

      <section className="section" id="analysis">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">{copy.marketAnalysis}</span>
              <h2>{copy.sessionInsights}</h2>
            </div>

            <Link
              href={localizeHref("/analysis", locale)}
              className="text-link"
            >
              {copy.viewAnalysis}
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {analyses.length ? (
            <div className="analysis-grid">
              {analyses.map((article) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <ArticleEmptyState compact locale={locale} />
          )}
        </div>
      </section>

      <section className="section section-muted" id="academy">
        <div className="container academy-layout">
          <div className="academy-intro">
            <span className="section-kicker">{copy.academy}</span>

            <h2>{copy.academyTitle}</h2>

            <p>{copy.academyDescription}</p>

            <Link href={localizeHref("/academy", locale)} className="button">
              {copy.startLearning}
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="academy-topics">
            {copy.topics.map(([number, title, description]) => (
              <article className="academy-topic" key={number}>
                <span>{number}</span>

                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>

                <span className="topic-arrow" aria-hidden="true">
                  ↗
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="newsletter-section" id="newsletter">
        <div className="container newsletter-layout">
          <div>
            <span className="section-kicker">{copy.brief}</span>

            <h2>{copy.newsletterTitle}</h2>

            <p>{copy.newsletterDescription}</p>
          </div>

          <NewsletterForm locale={locale} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
