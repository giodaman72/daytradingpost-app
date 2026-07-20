"use client";

export default function AcademyErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="academy-route-state">
      <span className="section-kicker">Academy temporarily unavailable</span>
      <h1>The learning workspace could not be loaded.</h1>
      <p>
        Your saved progress has not been changed. Try loading this Academy page
        again.
      </p>
      <button className="button" type="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
