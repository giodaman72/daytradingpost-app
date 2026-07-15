"use client";
export default function WatchlistError({ reset }: { reset: () => void }) {
  return (
    <main className="smart-page">
      <section className="smart-content">
        <div className="container smart-empty" role="alert">
          <h1>Watchlists are unavailable</h1>
          <p>
            Confirm the Sprint 12 Supabase migration has been applied, then try
            again.
          </p>
          <button className="button" onClick={reset}>
            Try again
          </button>
        </div>
      </section>
    </main>
  );
}
