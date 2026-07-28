import { startAssessmentAttempt } from "@/lib/academy/assessments/assessmentService";
import { academyErrorResponse } from "@/lib/academy/academyHttp";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ assessmentId: string }> },
) {
  try {
    const { assessmentId } = await context.params;
    return Response.json(
      { data: await startAssessmentAttempt(assessmentId) },
      { status: 201 },
    );
  } catch (error) {
    return academyErrorResponse(error);
  }
}
