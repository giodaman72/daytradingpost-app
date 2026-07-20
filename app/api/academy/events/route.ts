import { recordAcademyEvent } from "@/lib/academy/academyEventService";
import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";

export async function POST(request: Request) {
  try {
    const body = await readAcademyJson(request, 4_000);
    await recordAcademyEvent({
      assessmentId:
        typeof body.assessmentId === "string" ? body.assessmentId : undefined,
      courseId: typeof body.courseId === "string" ? body.courseId : undefined,
      idempotencyKey: String(body.idempotencyKey ?? ""),
      lessonId: typeof body.lessonId === "string" ? body.lessonId : undefined,
      moduleId: typeof body.moduleId === "string" ? body.moduleId : undefined,
      name: String(body.name ?? ""),
    });
    return Response.json({ ok: true }, { status: 202 });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
