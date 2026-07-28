import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import { updateLessonProgress } from "@/lib/academy/progress/progressService";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ lessonId: string }> },
) {
  try {
    const { lessonId } = await context.params;
    const body = await readAcademyJson(request, 2_000);
    return Response.json({
      data: await updateLessonProgress({
        durationSeconds: Number(body.durationSeconds),
        enrollmentId: String(body.enrollmentId ?? ""),
        lessonId,
        positionSeconds: Number(body.positionSeconds),
      }),
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
