import Link from "next/link";

export default function AssessmentNotFound() {
  return (
    <section className="academy-route-state">
      <span className="section-kicker">Assessment unavailable</span>
      <h1>This assessment attempt could not be opened.</h1>
      <p>
        It may belong to another account, be invalid, or no longer be available.
      </p>
      <Link href="/academy/courses" className="button">
        Return to Academy courses
      </Link>
    </section>
  );
}
