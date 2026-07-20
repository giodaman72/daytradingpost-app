import Link from "next/link";
import { LockKeyhole } from "lucide-react";

type AcademyLockedStateProps = {
  courseSlug: string;
  message: string;
  premium?: boolean;
  title?: string;
};

export function AcademyLockedState({
  courseSlug,
  message,
  premium = false,
  title = "This lesson is locked.",
}: AcademyLockedStateProps) {
  return (
    <div className="academy-locked-state">
      <LockKeyhole size={34} aria-hidden="true" />
      <span className="section-kicker">Protected course content</span>
      <h1>{title}</h1>
      <p>{message}</p>
      <div>
        <Link
          href={`/academy/courses/${courseSlug}/learn`}
          className="button button-secondary"
        >
          Return to curriculum
        </Link>
        {premium ? (
          <Link href="/premium" className="button">
            Explore Premium
          </Link>
        ) : null}
      </div>
    </div>
  );
}
