import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MembershipCheckoutForm } from "@/components/membership/MembershipCheckoutForm";
import { MEMBERSHIP_PLANS, PREMIUM_BENEFITS } from "@/constants/membership";
import { getMembershipAccess } from "@/lib/payments";
import { getPaymentProviderMode } from "@/lib/membership/config";
import { localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return locale === "es"
    ? {
        title: "Membresía Premium",
        description:
          "Elige una membresía Premium mensual o anual de DayTradingPost con pago seguro mediante Revolut.",
        alternates: {
          canonical: "/es/premium",
          languages: {
            "en-US": "/premium",
            es: "/es/premium",
            "x-default": "/premium",
          },
        },
      }
    : {
        title: "Premium membership",
        description:
          "Choose a monthly or annual DayTradingPost premium membership secured by Revolut.",
      };
}

export default async function PremiumPage() {
  const [locale, { user, hasPremiumAccess }] = await Promise.all([
    getRequestLocale(),
    getMembershipAccess(),
  ]);
  const spanish = locale === "es";
  const mode = getPaymentProviderMode();
  const isPaymentLinks = mode === "revolut_payment_links";

  return (
    <main className="membership-page">
      <Header />
      <section className="membership-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="container membership-heading">
          <span className="section-kicker">DayTradingPost Premium</span>
          <h1>
            {spanish
              ? "Más contexto de mercado. Un plan más disciplinado."
              : "Deeper market context. A more disciplined plan."}
          </h1>
          <p>
            {spanish
              ? "Desbloquea informes premium completos con pagos y estado de cuenta protegidos mediante Revolut y Supabase."
              : "Unlock complete premium briefings while keeping payment and account status secured through Revolut and Supabase."}
          </p>
          {hasPremiumAccess ? (
            <div className="membership-callout success" role="status">
              {spanish
                ? "Tu membresía Premium está activa. "
                : "Your premium membership is active. "}
              <Link href="/account/billing">
                {spanish ? "Gestionar facturación" : "Manage billing"}
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="membership-plan-grid">
            {(["monthly", "annual"] as const).map((plan) => (
              <article className="membership-plan-card" key={plan}>
                <span className="pricing-label">
                  {spanish
                    ? plan === "monthly"
                      ? "Membresía mensual"
                      : "Membresía anual"
                    : MEMBERSHIP_PLANS[plan].label}
                </span>
                <h2>
                  {spanish
                    ? plan === "monthly"
                      ? "Acceso mensual flexible"
                      : "Una membresía anual"
                    : MEMBERSHIP_PLANS[plan].name}
                </h2>
                <p className="membership-price-note">
                  {MEMBERSHIP_PLANS[plan].priceLabel}.{" "}
                  {spanish
                    ? "El pago se procesa de forma segura mediante Revolut."
                    : "Checkout is processed securely by Revolut."}
                </p>
                <ul className="premium-list">
                  {(spanish
                    ? [
                        "Análisis premium completo de mercados",
                        "Escenarios detallados y niveles técnicos",
                        "Notas de riesgo y planificación para miembros",
                        "Acceso Premium protegido en el servidor",
                      ]
                    : PREMIUM_BENEFITS
                  ).map((benefit) => (
                    <li key={benefit}>
                      <span aria-hidden="true">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
                {!hasPremiumAccess ? (
                  user ? (
                    <MembershipCheckoutForm plan={plan} locale={locale} />
                  ) : (
                    <Link
                      className="button button-full"
                      href={localizeHref(
                        `/login?next=${encodeURIComponent(localizeHref("/premium", locale))}`,
                        locale,
                      )}
                    >
                      {spanish
                        ? `Inicia sesión para elegir el plan ${plan === "monthly" ? "mensual" : "anual"}`
                        : `Sign in to choose ${plan}`}
                    </Link>
                  )
                ) : null}
              </article>
            ))}
          </div>

          <div className="membership-callout" role="note">
            <strong>
              {isPaymentLinks
                ? spanish
                  ? "Verificación mediante enlace de pago"
                  : "Payment-link verification"
                : spanish
                  ? "Pago con Revolut Merchant"
                  : "Revolut Merchant checkout"}
            </strong>
            <p>
              {isPaymentLinks
                ? spanish
                  ? "Antes del pago se crea una solicitud de membresía pendiente. El pago no concede acceso automáticamente; primero debe verificarlo un administrador. Conserva tu referencia de pago."
                  : "A pending membership request is created before checkout. Payment does not grant access automatically; an administrator verifies it first. Keep your payment reference."
                : spanish
                  ? "Revolut gestiona el pago. El acceso cambia únicamente cuando un webhook firmado confirma el estado de la suscripción."
                  : "Revolut handles checkout. Membership access changes only after a signed webhook confirms the subscription state."}
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
