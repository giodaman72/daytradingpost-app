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

function pdfSafeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E\n]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapPdfLine(text: string, width = 88) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function academyPdfFilename(title: string) {
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `${safe || "lesson-resource"}.pdf`;
}

function buildPdf(lines: string[]) {
  const pages = [];
  for (let index = 0; index < lines.length; index += 42)
    pages.push(lines.slice(index, index + 42));
  const objects: string[] = [];
  const pageObjectNumbers: number[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  pages.forEach((pageLines, index) => {
    const pageObject = 4 + index * 2;
    const contentObject = pageObject + 1;
    pageObjectNumbers.push(pageObject);
    const stream = [
      "BT",
      "/F1 12 Tf",
      "54 760 Td",
      "15 TL",
      ...pageLines.map((line) => `(${pdfSafeText(line)}) Tj T*`),
      "ET",
    ].join("\n");
    objects[pageObject] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObject} 0 R >>`;
    objects[contentObject] =
      `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`;
  });
  objects[2] =
    `<< /Type /Pages /Kids [${pageObjectNumbers.map((item) => `${item} 0 R`).join(" ")}] /Count ${pageObjectNumbers.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = Buffer.byteLength(pdf, "utf8");
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let index = 1; index < objects.length; index += 1)
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

function builtInChecklistPdf(resource: {
  copyrightNotice: string | null;
  description: string | null;
  lessonSummary?: string;
  lessonTitle?: string;
  resourceText?: string;
  title: string;
}) {
  const heading = resource.lessonTitle ?? resource.title.replace(/ checklist$/i, "");
  const intro =
    resource.lessonSummary ??
    resource.description ??
    "Read this lesson resource with one live or recent DayTradingPost market chart.";
  const sourceText = resource.resourceText?.trim();
  const rawLines = sourceText
    ? [
        "DayTradingPost Academy",
        heading,
        "",
        resource.copyrightNotice ?? "Educational content only. Not investment advice.",
        "",
        ...sourceText.split(/\n+/),
      ]
    : [
    "DayTradingPost Academy",
    heading,
    "",
    intro,
    "",
    resource.copyrightNotice ?? "Educational content only. Not investment advice.",
    "",
    "Lesson Context",
    "Use this resource to turn the lesson into a clear trading observation, a practical rule, and a risk-control decision before taking action.",
    "",
    "1. Market and Timeframe",
    "Instrument:",
    "Timeframe:",
    "Trading session:",
    "Date:",
    "",
    "2. Current Market Condition",
    "Trend:",
    "Key support:",
    "Key resistance:",
    "Volatility / momentum:",
    "",
    "3. Lesson Idea Applied to the Chart",
    "What do you see?",
    "",
    "What confirms it?",
    "",
    "What would invalidate it?",
    "",
    "4. Execution Checklist",
    "[ ] Bias is clear",
    "[ ] Entry condition is defined",
    "[ ] Stop level is defined before entry",
    "[ ] Target or exit rule is defined",
    "[ ] Risk per trade is acceptable",
    "[ ] No trade if confirmation is missing",
    "",
    "5. Notes",
    "",
  ];
  return buildPdf(rawLines.flatMap((line) => wrapPdfLine(line)));
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
    if (resource.url.startsWith("/") && (resource.resourceType === "checklist" || resource.resourceType === "pdf-guide")) {
      await recordAcademyEvent({
        courseId: resource.courseId,
        idempotencyKey: `resource:${resourceId}:${crypto.randomUUID()}`,
        lessonId: resource.lessonId,
        name: "academy_resource_downloaded",
      }).catch(() => undefined);
      return new Response(builtInChecklistPdf(resource), {
        headers: {
          "Cache-Control": "private, no-store",
          "Content-Disposition": `inline; filename="${academyPdfFilename(resource.title)}"`,
          "Content-Type": "application/pdf",
          "Referrer-Policy": "no-referrer",
          "X-Content-Type-Options": "nosniff",
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
