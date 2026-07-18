import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import { parsePagination } from "@/lib/academy/academyValidation";
import {
  createLearnerNote,
  listCourseNotes,
} from "@/lib/academy/notes/learnerNoteService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parsePagination(url, 100);
    return Response.json({
      data: await listCourseNotes(
        url.searchParams.get("courseId") ?? "",
        page.limit,
        page.offset,
      ),
      ...page,
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readAcademyJson(request, 10_000);
    return Response.json(
      {
        data: await createLearnerNote({
          courseId: String(body.courseId ?? ""),
          lessonId: String(body.lessonId ?? ""),
          moduleId: typeof body.moduleId === "string" ? body.moduleId : null,
          noteText: String(body.noteText ?? ""),
          positionSeconds:
            typeof body.positionSeconds === "number"
              ? body.positionSeconds
              : null,
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    return academyErrorResponse(error);
  }
}
