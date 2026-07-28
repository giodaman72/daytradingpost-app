import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import { enrollUserInCourse } from "@/lib/academy/academyService";
import {
  normalizePlainText,
  parseAcademySlug,
} from "@/lib/academy/academyValidation";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ courseSlug: string }> },
) {
  try {
    const { courseSlug } = await context.params;
    const body = await readAcademyJson(request, 2_000);
    parseAcademySlug(courseSlug);
    const idempotencyKey = normalizePlainText(
      request.headers.get("idempotency-key") ?? body.idempotencyKey,
      "Idempotency key",
      160,
    );
    return Response.json(
      {
        data: await enrollUserInCourse({
          courseSlug,
          idempotencyKey,
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    return academyErrorResponse(error);
  }
}
