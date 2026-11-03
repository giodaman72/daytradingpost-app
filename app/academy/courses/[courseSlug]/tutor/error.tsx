"use client";

import { usePathname } from "next/navigation";
import { AcademyTutorErrorState } from "@/components/academy/tutor/AcademyTutorErrorState";
import { academyLessonText } from "@/lib/academy/academyLessonText";

export default function CourseTutorError({ reset }: { reset: () => void }) {
  const pathname = usePathname();
  const tr = academyLessonText(
    pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en",
  );
  return (
    <section className="academy-section">
      <div className="container">
        <AcademyTutorErrorState
          message={tr("This course Tutor could not load.")}
        />
        <button
          className="button button-secondary"
          type="button"
          onClick={reset}
        >
          {tr("Try again")}
        </button>
      </div>
    </section>
  );
}
