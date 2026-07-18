import type { AcademyCourse } from "@/types/academy";
import { detectPrerequisiteCycle } from "../learningPaths/prerequisiteEngine";

export type AcademyValidationIssue = {
  code: string;
  message: string;
  path: string;
  severity: "error" | "warning";
};

export function validateCourseForPublication(
  course: AcademyCourse & {
    modules?: Array<{
      _id: string;
      lessonIds: string[];
      prerequisiteModuleIds: string[];
      status: string;
    }>;
  },
) {
  const issues: AcademyValidationIssue[] = [];
  if (!course.learningObjectives.length)
    issues.push({
      code: "OBJECTIVES_REQUIRED",
      message: "Published courses require learning objectives.",
      path: "learningObjectives",
      severity: "error",
    });
  if (!course.modules?.length)
    issues.push({
      code: "MODULES_REQUIRED",
      message: "Published courses require at least one module.",
      path: "modules",
      severity: "error",
    });
  for (const courseModule of course.modules ?? []) {
    if (courseModule.status !== "published")
      issues.push({
        code: "UNPUBLISHED_MODULE",
        message: "Every referenced module must be published.",
        path: `modules.${courseModule._id}`,
        severity: "error",
      });
    if (!courseModule.lessonIds.length)
      issues.push({
        code: "LESSONS_REQUIRED",
        message: "Every published module needs a lesson.",
        path: `modules.${courseModule._id}.lessons`,
        severity: "error",
      });
  }
  const cycle = detectPrerequisiteCycle(
    new Map(
      (course.modules ?? []).map((courseModule) => [
        courseModule._id,
        courseModule.prerequisiteModuleIds,
      ]),
    ),
  );
  if (cycle)
    issues.push({
      code: "PREREQUISITE_CYCLE",
      message: `Module prerequisite cycle: ${cycle.join(" -> ")}`,
      path: "modules",
      severity: "error",
    });
  return issues;
}
