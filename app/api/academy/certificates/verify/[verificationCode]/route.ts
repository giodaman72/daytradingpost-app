import { academyErrorResponse } from "@/lib/academy/academyHttp";
import { verifyCertificate } from "@/lib/academy/certificates/certificateService";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ verificationCode: string }> },
) {
  try {
    const { verificationCode } = await context.params;
    const result = await verifyCertificate(verificationCode, request);
    // Generic shape prevents distinguishing malformed and unknown codes.
    return Response.json(
      result ?? {
        valid: false,
        status: "not-found",
      },
      { status: result ? 200 : 404 },
    );
  } catch (error) {
    return academyErrorResponse(error);
  }
}
