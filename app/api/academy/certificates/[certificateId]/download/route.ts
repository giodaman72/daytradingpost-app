import { academyErrorResponse } from "@/lib/academy/academyHttp";
import {
  getCertificateVerificationUrl,
  getOwnedCertificate,
} from "@/lib/academy/certificates/certificateService";
import { buildCertificatePdf } from "@/lib/academy/certificates/certificatePdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ certificateId: string }> },
) {
  try {
    const { certificateId } = await context.params;
    const certificate = await getOwnedCertificate(certificateId);
    const pdf = await buildCertificatePdf({
      certificate,
      verificationUrl: getCertificateVerificationUrl(
        certificate,
        new URL(request.url).origin,
      ),
    });
    const filename = `${certificate.certificateNumber
      .replace(/[^A-Za-z0-9-]/g, "")
      .slice(0, 80)}.pdf`;
    return new Response(Uint8Array.from(pdf).buffer, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return academyErrorResponse(error);
  }
}
