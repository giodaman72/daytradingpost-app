import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { Locale } from "@/lib/i18n/config";
import { localizeHref } from "@/lib/i18n/config";

export function MembershipStatusPage({
  kicker,
  title,
  description,
  reference,
  tone = "pending",
  locale = "en",
}: {
  kicker: string;
  title: string;
  description: string;
  reference?: string | null;
  tone?: "success" | "pending" | "cancelled";
  locale?: Locale;
}) {
  const spanish = locale === "es";
  return (
    <main className="membership-page">
      <Header />
      <section className="membership-result-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className={`membership-result-card ${tone}`}>
          <span className="section-kicker">{kicker}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          {reference ? (
            <div className="payment-reference">
              <span>
                {spanish ? "Referencia de pago" : "Payment reference"}
              </span>
              <code>{reference}</code>
            </div>
          ) : null}
          <div className="membership-result-actions">
            <Link
              href={localizeHref("/account/billing", locale)}
              className="button"
            >
              {spanish ? "Ver estado de facturación" : "View billing status"}
            </Link>
            <Link
              href={localizeHref("/analysis", locale)}
              className="text-link"
            >
              {spanish ? "Explorar análisis →" : "Browse analysis →"}
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
