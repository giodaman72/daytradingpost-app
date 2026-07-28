import {
  academyErrorResponse,
  readAcademyJson,
} from "@/lib/academy/academyHttp";
import { revokeCertificate } from "@/lib/academy/certificates/certificateService";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ certificateId: string }> },
) {
  try {
    const { certificateId } = await context.params;
    const body = await readAcademyJson(request, 4_000);
    const certificate = await revokeCertificate({
      certificateId,
      confirmation: String(body.confirmation ?? ""),
      reason: String(body.reason ?? ""),
      requestId: String(body.requestId ?? ""),
    });
    return Response.json(
      { data: certificate },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return academyErrorResponse(error);
  }
}
