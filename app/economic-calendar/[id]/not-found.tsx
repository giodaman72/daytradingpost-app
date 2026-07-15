import Link from "next/link";

export default function EconomicEventNotFound() {
  return (
    <main className="economic-page">
      <section className="economic-library">
        <div className="container economic-empty">
          <h1>Economic event not found</h1>
          <p>
            The release may have been rescheduled, removed, or is not verified.
          </p>
          <Link className="button" href="/economic-calendar">
            Return to calendar
          </Link>
        </div>
      </section>
    </main>
  );
}
