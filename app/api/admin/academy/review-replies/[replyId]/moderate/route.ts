import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import { moderateInstructorReply } from "@/lib/academy/admin/academyInstructorReviewService";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ replyId: string }> },
) {
  try {
    return Response.json({
      data: await moderateInstructorReply(
        (await context.params).replyId,
        await readAcademyJson(request, 2_000),
      ),
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
