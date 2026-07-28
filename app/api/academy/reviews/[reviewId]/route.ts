import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import {
  editCourseReview,
  removeCourseReview,
} from "@/lib/academy/reviews/reviewService";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ reviewId: string }> },
) {
  try {
    return Response.json({
      data: await editCourseReview(
        (await context.params).reviewId,
        await readAcademyJson(request, 5_000),
      ),
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ reviewId: string }> },
) {
  try {
    await removeCourseReview((await context.params).reviewId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
