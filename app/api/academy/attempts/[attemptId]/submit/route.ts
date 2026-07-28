import { submitAssessmentAttempt } from "@/lib/academy/assessments/assessmentService";
import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import { normalizePlainText } from "@/lib/academy/academyValidation";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ attemptId: string }> },
) {
  try {
    const { attemptId } = await context.params;
    const body = await readAcademyJson(request, 100_000);
    const responses =
      body.responses &&
      typeof body.responses === "object" &&
      !Array.isArray(body.responses)
        ? (body.responses as Record<string, unknown>)
        : {};
    const idempotencyKey = normalizePlainText(
      request.headers.get("idempotency-key") ?? body.idempotencyKey,
      "Idempotency key",
      160,
    );
    return Response.json({
      data: await submitAssessmentAttempt({
        attemptId,
        idempotencyKey,
        responses,
      }),
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
