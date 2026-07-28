import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import { moderateReview } from "@/lib/academy/reviews/reviewModerationService";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ reviewId: string }> },
) {
  try {
    return Response.json({
      data: await moderateReview(
        (await context.params).reviewId,
        await readAcademyJson(request, 2_000),
      ),
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
