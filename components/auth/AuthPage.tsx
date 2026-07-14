import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <Header />
      <section className="auth-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="container auth-layout">
          <div className="auth-context">
            <span className="section-kicker">DayTradingPost members</span>
            <h2>One secure account for your trading intelligence.</h2>
            <ul>
              <li><span aria-hidden="true">✓</span> Manage membership access</li>
              <li><span aria-hidden="true">✓</span> Access future member-only briefings</li>
              <li><span aria-hidden="true">✓</span> Keep account data protected by RLS</li>
            </ul>
            <p>DayTradingPost never asks for brokerage credentials or trading passwords.</p>
          </div>
          {children}
        </div>
      </section>
      <Footer />
    </main>
  );
}
