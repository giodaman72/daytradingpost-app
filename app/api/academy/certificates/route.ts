import { academyErrorResponse } from "@/lib/academy/academyHttp";
import { getUserCertificates } from "@/lib/academy/certificates/certificateService";
import { parsePagination } from "@/lib/academy/academyValidation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const page = parsePagination(new URL(request.url), 100);
    return Response.json({
      data: await getUserCertificates(page.limit, page.offset),
      ...page,
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
