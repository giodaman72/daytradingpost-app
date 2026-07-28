import Link from "next/link";
import { BookX } from "lucide-react";

export default function CourseNotFound() {
  return (
    <section className="academy-route-state">
      <BookX size={36} aria-hidden="true" />
      <span className="section-kicker">404 · Academy</span>
      <h1>This course is not available.</h1>
      <p>
        It may be unpublished, scheduled for later, or its address may have
        changed.
      </p>
      <Link href="/academy/courses" className="button">
        Browse published courses
      </Link>
    </section>
  );
}
