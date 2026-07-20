"use client";

export default function AcademyAdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="academy-admin-page">
      <section className="container academy-admin-empty">
        <h1>Academy administration is unavailable</h1>
        <p>
          Check the Sanity read token and apply the Academy admin Supabase
          migration, then try again.
        </p>
        <button className="button" onClick={reset} type="button">
          Try again
        </button>
      </section>
    </main>
  );
}
