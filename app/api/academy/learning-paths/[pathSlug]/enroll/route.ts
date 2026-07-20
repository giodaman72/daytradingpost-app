import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import { enrollUserInLearningPath } from "@/lib/academy/learningPaths/learningPathService";
import {
  normalizePlainText,
  parseAcademySlug,
} from "@/lib/academy/academyValidation";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ pathSlug: string }> },
) {
  try {
    const { pathSlug } = await context.params;
    const body = await readAcademyJson(request, 2_000);
    parseAcademySlug(pathSlug);
    const idempotencyKey = normalizePlainText(
      request.headers.get("idempotency-key") ?? body.idempotencyKey,
      "Idempotency key",
      160,
    );
    return Response.json(
      {
        data: await enrollUserInLearningPath({
          idempotencyKey,
          pathSlug,
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    return academyErrorResponse(error);
  }
}
