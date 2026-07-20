import { NextResponse } from "next/server";
import { AcademyError } from "@/lib/academy/academyErrors";
import { academyErrorResponse } from "@/lib/academy/academyHttp";
import { isSafeAcademyResourceUrl } from "@/lib/academy/academyPresentation";
import { getAuthorizedAcademyResource } from "@/lib/academy/academyService";
import { recordAcademyEvent } from "@/lib/academy/academyEventService";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ resourceId: string }> },
) {
  try {
    const { resourceId } = await context.params;
    const url = new URL(request.url);
    const resource = await getAuthorizedAcademyResource({
      courseSlug: url.searchParams.get("courseSlug") ?? "",
      lessonSlug: url.searchParams.get("lessonSlug") ?? "",
      resourceId,
    });
    if (
      !isSafeAcademyResourceUrl(resource.url) ||
      !resource.url.startsWith("https://")
    )
      throw new AcademyError(
        "ACADEMY_FORBIDDEN",
        "This lesson resource is unavailable.",
      );
    await recordAcademyEvent({
      courseId: resource.courseId,
      idempotencyKey: `resource:${resourceId}:${crypto.randomUUID()}`,
      lessonId: resource.lessonId,
      name: "academy_resource_downloaded",
    }).catch(() => undefined);
    return NextResponse.redirect(resource.url, {
      headers: {
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
      },
      status: 307,
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
