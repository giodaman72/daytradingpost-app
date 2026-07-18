import "server-only";

import { checkPublicApiRateLimit } from "@/lib/rateLimit";
import { requireAcademyUser } from "../academyAuthorization";
import { AcademyError } from "../academyErrors";
import { verifyCertificateRecord } from "../academyRepository";
import { parseVerificationCode } from "../academyValidation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function verifyCertificate(code: string, request?: Request) {
  if (request) {
    const retryAfter = checkPublicApiRateLimit(request);
    if (retryAfter)
      throw new AcademyError(
        "ACADEMY_RATE_LIMITED",
        "Too many verification requests. Please try again later.",
        { retryAfter },
      );
  }
  return verifyCertificateRecord(parseVerificationCode(code));
}

export async function getUserCertificates(limit = 50, offset = 0) {
  const access = await requireAcademyUser();
  const { data, error } = await getSupabaseAdmin()
    .from("academy_certificates")
    .select(
      "id,course_id,course_version,certificate_number,status,issued_at,revoked_at,learner_display_name,course_title_snapshot,instructor_name_snapshot,completion_date",
    )
    .eq("user_id", access.userId)
    .order("issued_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificates are unavailable.",
    );
  return data ?? [];
}
