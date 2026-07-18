import type { AcademyPrerequisiteResult } from "@/types/academy";

export function evaluatePrerequisites(
  requirements: Array<{
    id: string;
    kind: AcademyPrerequisiteResult["unmet"][number]["kind"];
  }>,
  completedIds: ReadonlySet<string>,
): AcademyPrerequisiteResult {
  const unmet = requirements.filter((item) => !completedIds.has(item.id));
  return { met: unmet.length === 0, unmet };
}

export function detectPrerequisiteCycle(
  graph: ReadonlyMap<string, readonly string[]>,
) {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(node: string): string[] | null {
    if (visiting.has(node)) return [node];
    if (visited.has(node)) return null;
    visiting.add(node);
    for (const dependency of graph.get(node) ?? []) {
      const cycle = visit(dependency);
      if (cycle) return [...cycle, node];
    }
    visiting.delete(node);
    visited.add(node);
    return null;
  }

  for (const node of graph.keys()) {
    const cycle = visit(node);
    if (cycle) return cycle.reverse();
  }
  return null;
}

export function getNextAvailableLesson(
  orderedLessonIds: string[],
  completedIds: ReadonlySet<string>,
  prerequisites: ReadonlyMap<string, readonly string[]>,
) {
  return (
    orderedLessonIds.find(
      (id) =>
        !completedIds.has(id) &&
        (prerequisites.get(id) ?? []).every((required) =>
          completedIds.has(required),
        ),
    ) ?? null
  );
}
