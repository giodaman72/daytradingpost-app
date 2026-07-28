import { academyErrorResponse } from "@/lib/academy/academyHttp";
import { listAcademyCourses } from "@/lib/academy/academyService";
import { parsePagination } from "@/lib/academy/academyValidation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const page = parsePagination(new URL(request.url), 50);
    return Response.json({
      data: await listAcademyCourses(page.limit, page.offset),
      ...page,
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
