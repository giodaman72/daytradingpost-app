import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getArticleImageUrl } from "@/lib/sanity/image";
import type { Article, ArticleSummary } from "@/types/article";
import { ArticleBody } from "./ArticleBody";
import { LevelList } from "./LevelList";
import { MarketIntelligenceSummary } from "@/components/market-intelligence/MarketIntelligenceSummary";
import { MarketOutlookCard } from "@/components/market-intelligence/MarketOutlookCard";
import { summarizeMarketIntelligence } from "@/lib/market/marketIntelligenceTransforms";
import type { MarketIntelligenceRecord } from "@/types/market-intelligence";
import type { MarketQuote } from "@/types/market-data";
import { MarketDataCard } from "@/components/market-data/MarketDataCard";
import { MarketQuickActions } from "@/components/alerts/MarketQuickActions";
import { AssistantContextActions } from "@/components/assistant/AssistantContextActions";
import { localizeHref, type Locale } from "@/lib/i18n/config";

type ArticleLayoutProps = (
  | { article: Article; locked?: false }
  | { article: ArticleSummary; locked: true }
) & {
  intelligence?: MarketIntelligenceRecord | null;
  marketQuote?: MarketQuote | null;
  locale?: Locale;
};

function formatPublishedDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function ArticleLayout(props: ArticleLayoutProps) {
  const locale = props.locale ?? "en";
  const spanish = locale === "es";
  const article = props.article;
  const fullArticle = props.locked ? null : props.article;
  const imageUrl = getArticleImageUrl(article, 1600, 900);
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
  const articleTitle = article.title;
  const articleExcerpt = article.excerpt;
  const biasLabels: Record<string, string> = {
    Bullish: "Alcista",
    Neutral: "Neutral",
    Bearish: "Bajista",
  };

  return (
    <main className="analysis-page">
      <Header />

      <section className="analysis-detail-hero analysis-article-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />

        <div className="container analysis-detail-heading">
          <nav
            className="analysis-breadcrumbs"
            aria-label={spanish ? "Migas de pan" : "Breadcrumb"}
          >
            <Link href={localizeHref("/", locale)}>
              {spanish ? "Inicio" : "Home"}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href={localizeHref("/analysis", locale)}>
              {spanish ? "Análisis" : "Analysis"}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{articleTitle}</span>
          </nav>

          <div className="analysis-article-heading-grid">
            <div>
              <div className="analysis-article-labels">
                <span className="section-kicker">{category}</span>
                <span className="analysis-access-badge static">
                  {article.accessLevel === "premium"
                    ? "Premium"
                    : spanish
                      ? "Gratis"
                      : "Free"}
                </span>
              </div>
              <h1>{articleTitle}</h1>
              <p className="analysis-article-excerpt">{articleExcerpt}</p>

              <div className="analysis-byline">
                <span>
                  {spanish ? "Por" : "By"}{" "}
                  <strong>
                    {article.author?.name ||
                      (spanish
                        ? "Investigación de DayTradingPost"
                        : "DayTradingPost Research")}
                  </strong>
                </span>
                <span>{formatPublishedDate(article.publishedAt, locale)}</span>
                <span>{article.instrumentSymbol}</span>
                <span
                  className={`analysis-bias bias-${article.marketBias.toLowerCase()}`}
                >
                  {spanish
                    ? `${biasLabels[article.marketBias] ?? article.marketBias} · sesgo`
                    : `${article.marketBias} bias`}
                </span>
              </div>
            </div>

            <div className="analysis-featured-image">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={article.featuredImage?.alt || article.title}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 520px"
                />
              ) : (
                <div className="visual-lines" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              )}
            </div>
          </div>

          <div className="sample-content-notice" role="note">
            <strong>
              {spanish ? "Análisis educativo" : "Educational analysis"}
            </strong>
            <span>
              {spanish
                ? "Los niveles y el sesgo reflejan el análisis publicado por el autor en el momento indicado. No son precios en directo ni recomendaciones de trading personalizadas."
                : "Market levels and bias reflect the author's published analysis at the stated time. They are not live prices or personalized trade recommendations."}
            </span>
          </div>
        </div>
      </section>

      <section className="analysis-detail-body">
        <div className="container analysis-detail-layout">
          <article className="analysis-detail-main">
            {props.marketQuote ? (
              <section
                className="analysis-market-data"
                aria-labelledby="analysis-market-data-title"
              >
                <div className="analysis-market-data-heading">
                  <div>
                    <span className="section-kicker">
                      {spanish ? "Datos de mercado" : "Market data"}
                    </span>
                    <h2 id="analysis-market-data-title">
                      {spanish
                        ? "Resumen actual del proveedor"
                        : "Current provider snapshot"}
                    </h2>
                  </div>
                  <p>
                    {spanish
                      ? "Separado de la perspectiva editorial publicada por el autor."
                      : "Separate from the author's published editorial outlook."}
                  </p>
                </div>
                <MarketDataCard
                  quote={props.marketQuote}
                  compact
                  locale={locale}
                />
              </section>
            ) : null}
            <MarketQuickActions instrument={article.instrumentSymbol} />
            <AssistantContextActions
              mode="article_explanation"
              instrument={article.instrumentSymbol}
              article={article.slug}
              title={spanish ? "Pregunta al asistente con IA" : undefined}
              prompts={
                spanish
                  ? [
                      "Explica este análisis en términos más sencillos.",
                      "Explica los escenarios alcista y bajista.",
                      "Explica los niveles de soporte y resistencia.",
                      "¿Cuáles son los principales factores de riesgo de este análisis?",
                    ]
                  : [
                      "Explain this analysis in simpler terms.",
                      "Explain the bullish and bearish scenarios.",
                      "Explain the support and resistance levels.",
                      "What are the key risk factors in this analysis?",
                    ]
              }
              locale={locale}
            />
            {props.intelligence ? (
              fullArticle ? (
                <MarketIntelligenceSummary
                  intelligence={props.intelligence}
                  locale={locale}
                />
              ) : (
                <MarketOutlookCard
                  outlook={summarizeMarketIntelligence(props.intelligence)}
                  locale={locale}
                />
              )
            ) : null}
            {!fullArticle ? (
              <section
                className="premium-article-gate"
                aria-labelledby="premium-gate-title"
              >
                <span className="section-kicker">
                  {spanish ? "Vista previa Premium" : "Premium preview"}
                </span>
                <h2 id="premium-gate-title">
                  {spanish
                    ? "Desbloquea el informe de mercado completo."
                    : "Unlock the complete market briefing."}
                </h2>
                <p>
                  {spanish
                    ? "Esta vista previa incluye el mercado, el sesgo y el resumen publicados. Los miembros Premium pueden leer el análisis técnico completo, los niveles, los factores de riesgo y las notas de planificación."
                    : "This preview includes the published market, bias and summary. Premium members can read the complete technical analysis, levels, risk factors and planning notes."}
                </p>
                <div className="premium-gate-actions">
                  <Link
                    href={localizeHref("/premium", locale)}
                    className="button"
                  >
                    {spanish ? "Ver planes Premium" : "View premium plans"}
                  </Link>
                  <Link
                    href={localizeHref(
                      `/login?next=${encodeURIComponent(`/analysis/${article.slug}`)}`,
                      locale,
                    )}
                    className="text-link"
                  >
                    {spanish
                      ? "Inicia sesión para comprobar el acceso →"
                      : "Sign in to check access →"}
                  </Link>
                </div>
              </section>
            ) : (
              <>
                <ArticleBody body={fullArticle.body} locale={locale} />

                <section className="analysis-content-section analysis-risk-section">
                  <span className="analysis-section-number">!</span>
                  <div>
                    <span className="section-kicker">
                      {spanish
                        ? "Principales factores de riesgo"
                        : "Primary risk factors"}
                    </span>
                    <h2>
                      {spanish
                        ? "Qué podría cambiar la perspectiva"
                        : "What could change the outlook"}
                    </h2>
                    <ul className="analysis-checklist risk-factor-list">
                      {fullArticle.riskFactors.map((factor) => (
                        <li key={factor}>
                          <span aria-hidden="true">!</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </>
            )}

            <aside className="analysis-risk-disclaimer">
              <span>
                {spanish
                  ? "Aviso educativo de riesgo"
                  : "Educational risk disclaimer"}
              </span>
              <p>
                {spanish
                  ? "El contenido de DayTradingPost se ofrece únicamente con fines educativos e informativos. No constituye asesoramiento de inversión, una solicitud ni una señal de trading. Las condiciones del mercado pueden cambiar sin aviso, y operar con productos apalancados o activos digitales puede generar pérdidas considerables. Verifica toda la información de forma independiente y nunca arriesgues capital que no puedas permitirte perder."
                  : "DayTradingPost content is provided for educational and informational purposes only. It is not investment advice, a solicitation, or a trade signal. Market conditions can change without notice, and trading leveraged products or digital assets can result in substantial losses. Verify all information independently and never risk capital you cannot afford to lose."}
              </p>
            </aside>
          </article>

          {!fullArticle ? (
            <aside
              className="analysis-levels-panel premium-preview-panel"
              aria-label={
                spanish
                  ? "Vista previa de contenido Premium"
                  : "Premium content preview"
              }
            >
              <span className="panel-label">
                {spanish
                  ? "Análisis exclusivo para miembros"
                  : "Member-only analysis"}
              </span>
              <h2>
                {spanish ? "Incluido con Premium" : "Included with Premium"}
              </h2>
              <ul>
                <li>
                  {spanish
                    ? "Mapa de soporte y resistencia"
                    : "Support and resistance map"}
                </li>
                <li>
                  {spanish
                    ? "Resumen técnico completo"
                    : "Full technical overview"}
                </li>
                <li>
                  {spanish
                    ? "Principales factores de riesgo"
                    : "Primary risk factors"}
                </li>
                <li>
                  {spanish
                    ? "Contexto para planificar operaciones"
                    : "Trade-planning context"}
                </li>
              </ul>
            </aside>
          ) : (
            <aside
              className="analysis-levels-panel"
              aria-label={`${article.instrumentSymbol} ${
                spanish ? "niveles clave" : "key levels"
              }`}
            >
              <div className="levels-panel-heading">
                <span className="panel-label">
                  {spanish ? "Niveles publicados" : "Published levels"}
                </span>
                <h2>{spanish ? "Mapa técnico" : "Technical map"}</h2>
              </div>
              <LevelList
                label={spanish ? "Resistencia" : "Resistance"}
                levels={fullArticle.resistanceLevels}
                tone="resistance"
                levelLabel={spanish ? "Nivel" : "Level"}
              />
              <LevelList
                label={spanish ? "Soporte" : "Support"}
                levels={fullArticle.supportLevels}
                tone="support"
                levelLabel={spanish ? "Nivel" : "Level"}
              />
              <p>
                {spanish
                  ? "Análisis publicado · Confirma de forma independiente los precios actuales"
                  : "Published analysis · Confirm current market prices independently"}
              </p>
            </aside>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
