import type { AcademyDifficulty, AcademyLearningPath } from "@/types/academy";

export type LearningPathRecommendation = {
  path: AcademyLearningPath;
  reason: string;
};

const difficultyOrder: Record<AcademyDifficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export function recommendLearningPaths(input: {
  completedPathIds: ReadonlySet<string>;
  currentDifficulty?: AcademyDifficulty | null;
  enrolledPathIds: ReadonlySet<string>;
  paths: AcademyLearningPath[];
  limit?: number;
}): LearningPathRecommendation[] {
  return input.paths
    .filter(
      (path) =>
        !input.completedPathIds.has(path.id) &&
        !input.enrolledPathIds.has(path.id) &&
        path.prerequisitePathIds.every((id) => input.completedPathIds.has(id)),
    )
    .toSorted((left, right) => {
      if (left.featured !== right.featured) return left.featured ? -1 : 1;
      if (!input.currentDifficulty) return 0;
      return (
        Math.abs(
          difficultyOrder[left.difficulty] -
            difficultyOrder[input.currentDifficulty],
        ) -
        Math.abs(
          difficultyOrder[right.difficulty] -
            difficultyOrder[input.currentDifficulty],
        )
      );
    })
    .map((path) => ({
      path,
      reason: path.prerequisitePathIds.length
        ? "Recommended because you completed its prerequisite learning path."
        : input.currentDifficulty === path.difficulty
          ? `Recommended at your current ${path.difficulty} learning level.`
          : path.featured
            ? "Featured by the DayTradingPost Academy editorial team."
            : "A structured next step with no prerequisite learning path.",
    }))
    .slice(0, input.limit ?? 3);
}
