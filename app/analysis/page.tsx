import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/analysis/ArticleCard";
import { ArticleEmptyState } from "@/components/analysis/ArticleEmptyState";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getArticles } from "@/lib/cms";
import { languageAlternates, localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const spanish = locale === "es";
  const canonical = localizeHref("/analysis", locale);
  const description = spanish
    ? "Consulta análisis técnico, contexto de mercado, niveles clave e información educativa de trading de DayTradingPost."
    : "Read DayTradingPost technical analysis, market context, key levels and educational trading insights.";
  return {
    title: spanish ? "Análisis de mercados" : "Market Analysis",
    description,
    alternates: {
      canonical,
      languages: languageAlternates("/analysis"),
    },
    openGraph: {
      title: spanish
        ? "Análisis de mercados | DayTradingPost"
        : "Market Analysis | DayTradingPost",
      description,
      url: canonical,
      type: "website",
    },
  };
}

export default async function AnalysisPage() {
  const [locale, articles] = await Promise.all([
    getRequestLocale(),
    getArticles(),
  ]);
  const spanish = locale === "es";

  return (
    <main className="analysis-page">
      <Header />

      <section className="analysis-landing-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />

        <div className="container analysis-landing-copy">
          <nav
            className="analysis-breadcrumbs"
            aria-label={spanish ? "Migas de pan" : "Breadcrumb"}
          >
            <Link href={localizeHref("/", locale)}>
              {spanish ? "Inicio" : "Home"}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Analysis</span>
          </nav>

          <span className="section-kicker">
            {spanish
              ? "Inteligencia de mercados publicada"
              : "Published market intelligence"}
          </span>
          <h1>
            {spanish
              ? "Convierte la estructura del mercado en un plan de trading más claro."
              : "Turn market structure into a clearer trading plan."}
          </h1>
          <p>
            {spanish
              ? "Explora el contexto técnico, los niveles clave y los informes de mercado con enfoque de riesgo publicados por el equipo de análisis de DayTradingPost."
              : "Explore technical context, key levels and risk-aware market briefings published by the DayTradingPost research desk."}
          </p>

          <div className="sample-content-notice" role="note">
            <strong>
              {spanish ? "Contenido educativo" : "Educational content"}
            </strong>
            <span>
              {spanish
                ? "El análisis es informativo y depende del momento de publicación. No constituye datos de mercado en directo, asesoramiento personalizado ni una recomendación para operar."
                : "Analysis is informational and time-sensitive. It is not live market data, personalized advice, or a recommendation to trade."}
            </span>
          </div>
        </div>
      </section>

      <section className="analysis-library-section">
        <div className="container">
          <div className="analysis-library-heading">
            <div>
              <span className="section-kicker">
                {spanish ? "Biblioteca de análisis" : "Analysis library"}
              </span>
              <h2>{spanish ? "Últimos informes" : "Latest research"}</h2>
            </div>
            <p>
              {spanish
                ? "Cada artículo combina contexto de mercado, niveles técnicos, principales factores de riesgo y un marco educativo de planificación."
                : "Each article combines market context, technical levels, primary risk factors and an educational planning framework."}
            </p>
          </div>

          {articles.length ? (
            <div className="analysis-market-grid">
              {articles.map((article) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <ArticleEmptyState locale={locale} />
          )}
        </div>
      </section>

      <section className="analysis-method-section">
        <div className="container analysis-method-layout">
          <div>
            <span className="section-kicker">
              {spanish
                ? "El método DayTradingPost"
                : "The DayTradingPost method"}
            </span>
            <h2>
              {spanish
                ? "Primero el contexto. Después los escenarios. Siempre el riesgo."
                : "Context first. Scenarios second. Risk always."}
            </h2>
          </div>
          <div className="analysis-method-steps">
            <article>
              <span>01</span>
              <h3>{spanish ? "Lee la estructura" : "Read the structure"}</h3>
              <p>
                {spanish
                  ? "Define la tendencia, las condiciones del rango y los niveles que controlan el precio."
                  : "Define trend, range conditions and the levels controlling price."}
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>{spanish ? "Cuestiona la tesis" : "Challenge the thesis"}</h3>
              <p>
                {spanish
                  ? "Identifica catalizadores y condiciones que podrían cambiar la perspectiva."
                  : "Identify catalysts and conditions that could change the outlook."}
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>
                {spanish ? "Define la invalidación" : "Define invalidation"}
              </h3>
              <p>
                {spanish
                  ? "Deja que el riesgo y el tamaño de la posición determinen si una configuración es viable."
                  : "Let risk and position sizing determine whether a setup is viable."}
              </p>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
