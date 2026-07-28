import { academyErrorResponse } from "@/lib/academy/academyHttp";
import { getAcademyCourse } from "@/lib/academy/academyService";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ courseSlug: string }> },
) {
  try {
    const { courseSlug } = await context.params;
    return Response.json({ data: await getAcademyCourse(courseSlug) });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
