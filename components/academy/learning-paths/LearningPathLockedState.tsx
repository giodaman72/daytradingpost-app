import Link from "next/link";
import { LockKeyhole } from "lucide-react";

type LearningPathLockedStateProps = {
  reason: string;
};

export function LearningPathLockedState({
  reason,
}: LearningPathLockedStateProps) {
  return (
    <div className="academy-locked-state">
      <LockKeyhole aria-hidden="true" />
      <h2>Enrollment is currently locked</h2>
      <p>{reason}</p>
      <div>
        <Link
          href="/academy/learning-paths"
          className="button button-secondary"
        >
          Browse learning paths
        </Link>
        {reason.toLowerCase().includes("premium") ? (
          <Link href="/premium" className="button">
            View Premium
          </Link>
        ) : null}
      </div>
    </div>
  );
}
