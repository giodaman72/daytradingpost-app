import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  isSitePagePath,
  sitePagePaths,
  sitePages,
  type SitePage,
} from "@/lib/site-pages";
import { EconomicCard } from "@/components/economic/EconomicCard";
import {
  getRecentEconomicReleases,
  getUpcomingEconomicEvents,
} from "@/lib/economic/economicService";
import { getEventsForMarket } from "@/lib/economic/economicImpact";
import { MarketQuickActions } from "@/components/alerts/MarketQuickActions";
import { AssistantContextActions } from "@/components/assistant/AssistantContextActions";
import { getSupportEmail } from "@/lib/config";
import { sitePagesEs } from "@/lib/site-pages-es";
import { languageAlternates, localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

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
  const locale = await getRequestLocale();

  if (!isSitePagePath(path)) {
    return {};
  }

  const page: SitePage = locale === "es" ? sitePagesEs[path] : sitePages[path];

  return {
    title: page.kicker,
    description: page.description,
    alternates: {
      canonical: localizeHref(`/${path}`, locale),
      languages: languageAlternates(`/${path}`),
    },
  };
}

export default async function SitePage({ params }: PageProps) {
  const { slug } = await params;
  const path = slug.join("/");
  const locale = await getRequestLocale();
  const spanish = locale === "es";

  if (!isSitePagePath(path)) {
    notFound();
  }

  const page: SitePage = spanish ? sitePagesEs[path] : sitePages[path];
  const supportEmail = getSupportEmail();
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
            <Link href={localizeHref("/", locale)} className="breadcrumb">
              <span aria-hidden="true">←</span>
              DayTradingPost
            </Link>

            <span className="section-kicker">{page.kicker}</span>
            <h1>{page.title}</h1>
            <p>{page.description}</p>

            <div className="inner-actions">
              <Link
                href={localizeHref(page.actionHref, locale)}
                className="button"
              >
                {page.actionLabel}
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href={localizeHref("/", locale)}
                className="button button-secondary"
              >
                {spanish ? "Volver al inicio" : "Back to homepage"}
              </Link>
            </div>
          </div>

          <aside
            className="inner-panel"
            aria-label={`${page.kicker} ${spanish ? "estado" : "status"}`}
          >
            <div className="inner-status">
              <span className="eyebrow-dot" aria-hidden="true" />
              {page.status}
            </div>

            <h2>{spanish ? "Qué puedes esperar" : "What to expect"}</h2>
            <ul>
              {page.highlights.map((highlight) => (
                <li key={highlight}>
                  <span aria-hidden="true">✓</span>
                  {highlight}
                </li>
              ))}
            </ul>

            <p>
              {spanish
                ? "La información se actualiza a medida que hay cobertura, sesiones y detalles operativos verificados."
                : "Information is updated as verified coverage, sessions, and operational details become available."}
            </p>
            {path === "contact" ? (
              supportEmail ? (
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
              ) : (
                <p role="alert">
                  {spanish
                    ? "Debe configurarse un correo de soporte antes del lanzamiento."
                    : "A production support email must be configured before launch."}
                </p>
              )
            ) : null}
          </aside>
        </div>
      </section>

      {page.sections?.length ? (
        <section className="section">
          <div className="container legal-content">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.items?.length ? (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
            <p>
              {spanish
                ? "Las preguntas sobre estos términos o las prácticas de privacidad pueden enviarse desde la "
                : "Questions about these terms or privacy practices can be sent through the "}
              <Link href={localizeHref("/contact", locale)}>
                {spanish ? "página de contacto" : "contact page"}
              </Link>
              .
            </p>
          </div>
        </section>
      ) : null}

      {marketKey ? (
        <section className="section market-economic-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  {spanish ? "Integración de mercados" : "Market integration"}
                </span>
                <h2>
                  {spanish ? "Próximos eventos para" : "Upcoming events for"}{" "}
                  {page.kicker}
                </h2>
              </div>
              <Link
                href={localizeHref("/economic-calendar", locale)}
                className="text-link"
              >
                {spanish ? "Calendario completo" : "Full calendar"} →
              </Link>
            </div>
            {marketEvents.length ? (
              <div className="economic-card-grid">
                {marketEvents.map((event) => (
                  <EconomicCard event={event} locale={locale} key={event.id} />
                ))}
              </div>
            ) : (
              <div className="economic-empty" role="status">
                <h3>
                  {spanish
                    ? "No hay próximos eventos verificados relevantes"
                    : "No relevant verified upcoming events"}
                </h3>
                <p>
                  {spanish
                    ? "Las publicaciones relevantes de divisas y alto impacto aparecerán cuando se conecte una fuente de calendario de producción."
                    : "Relevant currency and high-impact releases appear after a production calendar source is connected."}
                </p>
              </div>
            )}
            <div className="section-heading economic-recent-heading">
              <div>
                <span className="section-kicker">
                  {spanish ? "Publicaciones recientes" : "Recent releases"}
                </span>
                <h2>
                  {spanish
                    ? "Últimos resultados relacionados"
                    : "Latest related outcomes"}
                </h2>
              </div>
            </div>
            {recentEvents.length ? (
              <div className="economic-card-grid">
                {recentEvents.map((event) => (
                  <EconomicCard event={event} locale={locale} key={event.id} />
                ))}
              </div>
            ) : (
              <p className="economic-market-note">
                {spanish
                  ? "No hay publicaciones verificadas recientes."
                  : "No recent verified releases are available."}
              </p>
            )}
            <p className="economic-market-note">
              {spanish
                ? "La relación con divisas es únicamente informativa. "
                : "Relevant currency mapping is informational. "}
              <Link href={localizeHref("/analysis", locale)}>
                {spanish
                  ? "Explorar análisis editoriales relacionados →"
                  : "Browse related editorial analysis →"}
              </Link>
            </p>
            <MarketQuickActions instrument={marketKey} />
          </div>
        </section>
      ) : null}

      {path === "academy" ? (
        <section className="section">
          <div className="container">
            <AssistantContextActions
              mode="academy_tutor"
              title="Open Academy Tutor"
              prompts={[
                "Explain support and resistance in simpler terms.",
                "Create a short AI-generated practice quiz.",
                "Explain a general risk-management checklist.",
              ]}
            />
          </div>
        </section>
      ) : null}

      <Footer />
    </main>
  );
}
