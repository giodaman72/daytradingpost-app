import Link from "next/link";

export default function AttemptNotFound() {
  return (
    <section className="academy-section">
      <div className="container academy-locked-state">
        <span className="section-kicker">Assessment unavailable</span>
        <h1>This private assessment attempt was not found.</h1>
        <p>
          Confirm that you are signed in with the account that started the
          attempt.
        </p>
        <Link href="/academy/courses" className="button">
          Return to courses
        </Link>
      </div>
    </section>
  );
}
