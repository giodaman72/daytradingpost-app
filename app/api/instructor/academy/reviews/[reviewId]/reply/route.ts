import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import { saveInstructorReviewReply } from "@/lib/academy/admin/academyInstructorReviewService";

export async function POST(
  request: Request,
  context: { params: Promise<{ reviewId: string }> },
) {
  try {
    return Response.json(
      {
        data: await saveInstructorReviewReply(
          (await context.params).reviewId,
          await readAcademyJson(request, 2_000),
        ),
      },
      { status: 201 },
    );
  } catch (error) {
    return academyErrorResponse(error);
  }
}
