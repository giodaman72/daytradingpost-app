import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { Locale } from "@/lib/i18n/config";

export function AuthPage({
  children,
  locale = "en",
}: {
  children: React.ReactNode;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  return (
    <main className="auth-page">
      <Header />
      <section className="auth-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="container auth-layout">
          <div className="auth-context">
            <span className="section-kicker">
              {spanish
                ? "Miembros de DayTradingPost"
                : "DayTradingPost members"}
            </span>
            <h2>
              {spanish
                ? "Una cuenta segura para tu inteligencia de trading."
                : "One secure account for your trading intelligence."}
            </h2>
            <ul>
              <li>
                <span aria-hidden="true">✓</span>{" "}
                {spanish ? "Gestiona tu membresía" : "Manage membership access"}
              </li>
              <li>
                <span aria-hidden="true">✓</span>{" "}
                {spanish
                  ? "Accede a futuros informes exclusivos"
                  : "Access future member-only briefings"}
              </li>
              <li>
                <span aria-hidden="true">✓</span>{" "}
                {spanish
                  ? "Mantén los datos protegidos mediante RLS"
                  : "Keep account data protected by RLS"}
              </li>
            </ul>
            <p>
              {spanish
                ? "DayTradingPost nunca solicita credenciales de bróker ni contraseñas de trading."
                : "DayTradingPost never asks for brokerage credentials or trading passwords."}
            </p>
          </div>
          {children}
        </div>
      </section>
      <Footer />
    </main>
  );
}
