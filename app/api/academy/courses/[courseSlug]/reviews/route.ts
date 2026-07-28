import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import {
  createCourseReview,
  getCourseReviews,
} from "@/lib/academy/reviews/reviewService";
import { getAcademyCourse } from "@/lib/academy/academyService";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ courseSlug: string }> },
) {
  try {
    const course = await getAcademyCourse((await context.params).courseSlug);
    return Response.json({ data: await getCourseReviews(course.id) });
  } catch (error) {
    return academyErrorResponse(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ courseSlug: string }> },
) {
  try {
    return Response.json(
      {
        data: await createCourseReview(
          (await context.params).courseSlug,
          await readAcademyJson(request, 5_000),
        ),
      },
      { status: 201 },
    );
  } catch (error) {
    return academyErrorResponse(error);
  }
}
