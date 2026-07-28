import { getAssessmentAttemptForLearner } from "@/lib/academy/assessments/assessmentService";
import { academyErrorResponse } from "@/lib/academy/academyHttp";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ attemptId: string }> },
) {
  try {
    const { attemptId } = await context.params;
    return Response.json({
      data: await getAssessmentAttemptForLearner(attemptId),
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
