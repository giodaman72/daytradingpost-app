import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import type { Locale } from "@/lib/i18n/config";
import type { NewsletterSource } from "@/lib/validation/newsletter";

const COPY = {
  en: {
    kicker: "Free market email",
    title: "Get new analysis and key levels in your inbox.",
    description:
      "Trade setups, technical levels and market context for gold, indices, oil and FX, sent when new analysis is published. Free, and you can unsubscribe at any time.",
  },
  es: {
    kicker: "Correo de mercados gratuito",
    title: "Recibe nuevos análisis y niveles clave en tu correo.",
    description:
      "Configuraciones de trading, niveles técnicos y contexto de mercado para oro, índices, petróleo y divisas, enviados cuando se publica un nuevo análisis. Gratis, y puedes cancelar la suscripción en cualquier momento.",
  },
} as const;

/** Newsletter signup block; `id="newsletter"` is the target of "/#newsletter" links. */
export function NewsletterSection({
  locale,
  source,
}: {
  locale: Locale;
  source: NewsletterSource;
}) {
  const copy = COPY[locale];
  return (
    <section
      className="newsletter-section"
      id="newsletter"
      aria-labelledby={`newsletter-title-${source}`}
    >
      <div className="container newsletter-layout">
        <div>
          <span className="section-kicker">{copy.kicker}</span>
          <h2 id={`newsletter-title-${source}`}>{copy.title}</h2>
          <p>{copy.description}</p>
        </div>
        <NewsletterForm locale={locale} source={source} />
      </div>
    </section>
  );
}
