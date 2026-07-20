import "server-only";

import { getAssessmentAttemptForLearner } from "@/lib/academy/assessments/assessmentService";
import { AcademyError } from "@/lib/academy/academyErrors";
import { AssistantError } from "@/lib/ai/assistantErrors";
import { isFinalAssessmentStatus } from "./academyTutorPolicy";

export async function isAcademyTutorAttemptActive(attemptId: string) {
  try {
    const view = await getAssessmentAttemptForLearner(attemptId);
    return !isFinalAssessmentStatus(view.attempt.status);
  } catch (error) {
    if (error instanceof AcademyError)
      throw new AssistantError(
        "FORBIDDEN",
        "This assessment attempt is not available to your account.",
        403,
      );
    throw error;
  }
}
