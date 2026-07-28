import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import { reportReview } from "@/lib/academy/reviews/reviewService";

export async function POST(
  request: Request,
  context: { params: Promise<{ reviewId: string }> },
) {
  try {
    await reportReview(
      (await context.params).reviewId,
      await readAcademyJson(request, 1_000),
    );
    return Response.json({ ok: true }, { status: 202 });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
