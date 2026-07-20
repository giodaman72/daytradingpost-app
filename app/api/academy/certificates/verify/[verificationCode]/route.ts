import { academyErrorResponse } from "@/lib/academy/academyHttp";
import { verifyCertificate } from "@/lib/academy/certificates/certificateService";
import { AcademyError } from "@/lib/academy/academyErrors";

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
    if (
      error instanceof AcademyError &&
      error.code === "ACADEMY_VALIDATION_FAILED"
    )
      return Response.json(
        { valid: false, status: "not-found" },
        { status: 404 },
      );
    return academyErrorResponse(error);
  }
}
