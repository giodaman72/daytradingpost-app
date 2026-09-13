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

function escapeDocumentHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function academyResourceFilename(title: string) {
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `${safe || "lesson-resource"}.doc`;
}

function builtInChecklistDocument(resource: {
  copyrightNotice: string | null;
  description: string | null;
  title: string;
}) {
  const title = escapeDocumentHtml(resource.title);
  const description = escapeDocumentHtml(
    resource.description ?? "Lesson worksheet",
  );
  const copyright = escapeDocumentHtml(
    resource.copyrightNotice ?? "Educational content only.",
  );
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #111827; line-height: 1.45; }
      h1 { color: #0f172a; font-size: 26px; margin-bottom: 4px; }
      h2 { color: #b7791f; font-size: 16px; margin-top: 24px; text-transform: uppercase; }
      table { border-collapse: collapse; width: 100%; margin-top: 8px; }
      td, th { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; }
      .muted { color: #64748b; font-size: 12px; }
      .box { border: 1px solid #cbd5e1; min-height: 72px; padding: 8px; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <p>${description}</p>
    <p class="muted">${copyright}</p>

    <h2>Lesson Context</h2>
    <p>Use this worksheet with one live or recent DayTradingPost market chart. The goal is to turn the lesson idea into a clear trading observation, a rule, and a risk-control decision before taking action.</p>

    <h2>1. Market and Timeframe</h2>
    <table>
      <tr><th>Instrument</th><td></td></tr>
      <tr><th>Timeframe</th><td></td></tr>
      <tr><th>Trading session</th><td></td></tr>
      <tr><th>Date</th><td></td></tr>
    </table>

    <h2>2. Current Market Condition</h2>
    <table>
      <tr><th>Trend</th><td></td></tr>
      <tr><th>Key support</th><td></td></tr>
      <tr><th>Key resistance</th><td></td></tr>
      <tr><th>Volatility / momentum</th><td></td></tr>
    </table>

    <h2>3. Lesson Idea Applied to the Chart</h2>
    <p><strong>What do you see?</strong></p>
    <div class="box"></div>
    <p><strong>What confirms it?</strong></p>
    <div class="box"></div>
    <p><strong>What would invalidate it?</strong></p>
    <div class="box"></div>

    <h2>4. Execution Checklist</h2>
    <p>[ ] Bias is clear</p>
    <p>[ ] Entry condition is defined</p>
    <p>[ ] Stop level is defined before entry</p>
    <p>[ ] Target or exit rule is defined</p>
    <p>[ ] Risk per trade is acceptable</p>
    <p>[ ] No trade if confirmation is missing</p>

    <h2>5. Notes</h2>
    <div class="box"></div>
  </body>
</html>`;
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
      return new Response(builtInChecklistDocument(resource), {
        headers: {
          "Cache-Control": "private, no-store",
          "Content-Disposition": `attachment; filename="${academyResourceFilename(resource.title)}"`,
          "Content-Type": "application/msword; charset=utf-8",
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
