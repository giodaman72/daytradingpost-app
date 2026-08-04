import type { AcademyLearningPath } from "@/types/academy";
import { LearningPathCard } from "./LearningPathCard";
import type { Locale } from "@/lib/i18n/config";

type LearningPathGridProps = {
  paths: AcademyLearningPath[];
  locale?: Locale;
};

export function LearningPathGrid({
  paths,
  locale = "en",
}: LearningPathGridProps) {
  return (
    <div className="learning-path-grid">
      {paths.map((path) => (
        <LearningPathCard key={path.id} path={path} locale={locale} />
      ))}
    </div>
  );
}
