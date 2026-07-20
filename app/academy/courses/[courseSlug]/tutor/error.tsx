"use client";

import { AcademyTutorErrorState } from "@/components/academy/tutor/AcademyTutorErrorState";

export default function CourseTutorError({ reset }: { reset: () => void }) {
  return (
    <section className="academy-section">
      <div className="container">
        <AcademyTutorErrorState message="This course Tutor could not load." />
        <button
          className="button button-secondary"
          type="button"
          onClick={reset}
        >
          Try again
        </button>
      </div>
    </section>
  );
}
