import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function AnalysisNotFound() {
  return (
    <main className="analysis-page">
      <Header />
      <section className="analysis-not-found">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container analysis-not-found-content">
          <span className="section-kicker">404 · Analysis</span>
          <h1>This market briefing is not available.</h1>
          <p>
            It may be unpublished, scheduled for later, or the address may have
            changed.
          </p>
          <Link href="/analysis" className="button">
            View all analysis <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
