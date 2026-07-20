"use client";

import { AcademyTutorErrorState } from "@/components/academy/tutor/AcademyTutorErrorState";

export default function AcademyTutorRouteError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <section className="academy-section">
      <div className="container">
        <AcademyTutorErrorState message="The Academy Tutor could not load." />
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
