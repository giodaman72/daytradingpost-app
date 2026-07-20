import Link from "next/link";

export default function LessonNotFound() {
  return (
    <section className="academy-section">
      <div className="container academy-locked-state">
        <span className="section-kicker">Lesson unavailable</span>
        <h1>This Academy lesson could not be found.</h1>
        <p>
          It may be unpublished, scheduled for later, or no longer part of this
          course.
        </p>
        <Link href="/academy/courses" className="button">
          Return to course catalog
        </Link>
      </div>
    </section>
  );
}
