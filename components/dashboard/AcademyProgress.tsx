import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
import type { AcademyEnrollment } from "@/types/academy";
import { DashboardPanel } from "./DashboardPanel";

type AcademyProgressProps = {
  courseTitle?: string | null;
  enrollment?: AcademyEnrollment | null;
};

export function AcademyProgress({
  courseTitle = null,
  enrollment = null,
}: AcademyProgressProps) {
  const percentage = Math.round(enrollment?.progressPercent ?? 0);
  return (
    <DashboardPanel
      id="academy-progress"
      eyebrow="Learning path"
      title="Academy Progress"
    >
      <div className="dashboard-progress-card">
        <div className="dashboard-progress-heading">
          <span>
            <BookOpenCheck size={21} aria-hidden="true" />
          </span>
          <div>
            <strong>{courseTitle ?? "Trading Academy"}</strong>
            <p>
              {enrollment
                ? `${enrollment.status.replace("_", " ")} course`
                : "No active course yet"}
            </p>
          </div>
          <b>{percentage}%</b>
        </div>
        <div
          className="dashboard-progress-track"
          role="progressbar"
          aria-label={`${courseTitle ?? "Academy course"} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <span style={{ width: `${percentage}%` }} />
        </div>
        <p>
          {enrollment
            ? "Continue from your private curriculum. Lesson and assessment progress is saved automatically."
            : "Choose a structured course in market process, risk management or trade planning."}
        </p>
        <Link
          href={
            enrollment
              ? `/academy/courses/${enrollment.courseSlug}/learn`
              : "/academy"
          }
          className="button button-secondary"
        >
          {enrollment ? "Continue course" : "Explore the academy"}
        </Link>
      </div>
    </DashboardPanel>
  );
}
