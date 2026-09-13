import { NextResponse } from "next/server";
import { AcademyError } from "@/lib/academy/academyErrors";
import { academyErrorResponse } from "@/lib/academy/academyHttp";
import { isSafeAcademyResourceUrl } from "@/lib/academy/academyPresentation";
import { getAuthorizedAcademyResource } from "@/lib/academy/academyService";
import { recordAcademyEvent } from "@/lib/academy/academyEventService";

export const dynamic = "force-dynamic";

function getAcademyResourceRedirectUrl(
  resourceUrl: string,
  requestUrl: string,
) {
  if (!isSafeAcademyResourceUrl(resourceUrl)) return null;
  if (resourceUrl.startsWith("/")) return new URL(resourceUrl, requestUrl);
  const url = new URL(resourceUrl);
  return url.protocol === "https:" ? url : null;
}

function academyResourceFilename(title: string) {
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `${safe || "lesson-resource"}.txt`;
}

function builtInChecklistText(resource: {
  copyrightNotice: string | null;
  description: string | null;
  title: string;
}) {
  return [
    resource.title,
    "",
    resource.description ?? "Lesson worksheet",
    resource.copyrightNotice ?? "Educational content only.",
    "",
    "1. Market and timeframe",
    "Instrument:",
    "Timeframe:",
    "Session:",
    "",
    "2. Current market condition",
    "Trend:",
    "Key support:",
    "Key resistance:",
    "Volatility:",
    "",
    "3. Lesson idea applied to the chart",
    "What do you see?",
    "What confirms it?",
    "What would invalidate it?",
    "",
    "4. Trade planning checklist",
    "[ ] Bias is clear",
    "[ ] Entry condition is defined",
    "[ ] Stop level is defined before entry",
    "[ ] Target or exit rule is defined",
    "[ ] Risk per trade is acceptable",
    "[ ] No trade if confirmation is missing",
    "",
    "5. Notes",
    "",
  ].join("\n");
}

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
    if (resource.url.startsWith("/") && resource.resourceType === "checklist") {
      await recordAcademyEvent({
        courseId: resource.courseId,
        idempotencyKey: `resource:${resourceId}:${crypto.randomUUID()}`,
        lessonId: resource.lessonId,
        name: "academy_resource_downloaded",
      }).catch(() => undefined);
      return new Response(builtInChecklistText(resource), {
        headers: {
          "Cache-Control": "private, no-store",
          "Content-Disposition": `attachment; filename="${academyResourceFilename(resource.title)}"`,
          "Content-Type": "text/plain; charset=utf-8",
          "Referrer-Policy": "no-referrer",
        },
      });
    }
    const redirectUrl = getAcademyResourceRedirectUrl(
      resource.url,
      request.url,
    );
    if (!redirectUrl)
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
    return NextResponse.redirect(redirectUrl, {
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
