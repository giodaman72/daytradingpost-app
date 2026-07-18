import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import { completeLesson } from "@/lib/academy/progress/progressService";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ lessonId: string }> },
) {
  try {
    const { lessonId } = await context.params;
    const body = await readAcademyJson(request, 2_000);
    return Response.json({
      data: await completeLesson(String(body.enrollmentId ?? ""), lessonId),
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
