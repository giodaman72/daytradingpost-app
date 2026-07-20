import { Check, Flag } from "lucide-react";

type LearningPathMilestoneProps = {
  achieved: boolean;
  label: string;
  threshold: number;
};

export function LearningPathMilestone({
  achieved,
  label,
  threshold,
}: LearningPathMilestoneProps) {
  return (
    <li className={achieved ? "achieved" : ""}>
      {achieved ? (
        <Check size={16} aria-hidden="true" />
      ) : (
        <Flag size={16} aria-hidden="true" />
      )}
      <span>
        <strong>{threshold}% milestone</strong>
        {label}
      </span>
    </li>
  );
}
