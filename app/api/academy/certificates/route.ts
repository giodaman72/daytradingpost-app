import { academyErrorResponse } from "@/lib/academy/academyHttp";
import { readAcademyJson } from "@/lib/academy/academyHttp";
import {
  getUserCertificates,
  issueCertificate,
} from "@/lib/academy/certificates/certificateService";
import { parsePagination } from "@/lib/academy/academyValidation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const page = parsePagination(new URL(request.url), 100);
    const result = await getUserCertificates(page.limit, page.offset);
    return Response.json({
      data: result.certificates,
      total: result.total,
      ...page,
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readAcademyJson(request, 2_000);
    const certificate = await issueCertificate({
      enrollmentId: String(body.enrollmentId ?? ""),
      idempotencyKey: String(body.idempotencyKey ?? ""),
    });
    return Response.json(
      { data: certificate },
      {
        headers: { "Cache-Control": "private, no-store" },
        status: 201,
      },
    );
  } catch (error) {
    return academyErrorResponse(error);
  }
}
