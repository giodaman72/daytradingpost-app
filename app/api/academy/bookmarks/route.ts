import {
  createBookmark,
  listCourseBookmarks,
} from "@/lib/academy/bookmarks/bookmarkService";
import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import { parsePagination } from "@/lib/academy/academyValidation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parsePagination(url, 100);
    return Response.json({
      data: await listCourseBookmarks(
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
    const body = await readAcademyJson(request, 5_000);
    return Response.json(
      {
        data: await createBookmark({
          courseId: String(body.courseId ?? ""),
          label: typeof body.label === "string" ? body.label : null,
          lessonId: String(body.lessonId ?? ""),
          moduleId: typeof body.moduleId === "string" ? body.moduleId : null,
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
