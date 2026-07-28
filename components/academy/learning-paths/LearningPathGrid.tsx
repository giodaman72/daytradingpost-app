import type { AcademyLearningPath } from "@/types/academy";
import { LearningPathCard } from "./LearningPathCard";

type LearningPathGridProps = {
  paths: AcademyLearningPath[];
};

export function LearningPathGrid({ paths }: LearningPathGridProps) {
  return (
    <div className="learning-path-grid">
      {paths.map((path) => (
        <LearningPathCard key={path.id} path={path} />
      ))}
    </div>
  );
}
