import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  AcademyCertificate,
  AcademyCertificateVerification,
} from "@/types/academy";
import { AcademyError } from "../academyErrors";

export function mapCertificate(
  row: Record<string, unknown>,
): AcademyCertificate {
  return {
    certificateNumber: String(row.certificate_number),
    completionDate: String(row.completion_date),
    courseId: String(row.course_id),
    courseTitleSnapshot: String(row.course_title_snapshot),
    courseVersion: Number(row.course_version),
    enrollmentId: String(row.enrollment_id),
    id: String(row.id),
    instructorNameSnapshot: row.instructor_name_snapshot as string | null,
    issuedAt: String(row.issued_at),
    learnerDisplayName: String(row.learner_display_name),
    revocationReason: row.revocation_reason as string | null,
    revokedAt: row.revoked_at as string | null,
    scoreSnapshot:
      row.score_snapshot === null || row.score_snapshot === undefined
        ? null
        : Number(row.score_snapshot),
    status: row.status as AcademyCertificate["status"],
    supersededByCertificateId:
      (row.superseded_by_certificate_id as string | null) ?? null,
    supersedesCertificateId:
      (row.supersedes_certificate_id as string | null) ?? null,
    userId: String(row.user_id),
    verificationCode: String(row.verification_code),
  };
}

const certificateColumns =
  "id,user_id,enrollment_id,course_id,course_version,certificate_number,verification_code,status,issued_at,revoked_at,revocation_reason,learner_display_name,course_title_snapshot,instructor_name_snapshot,completion_date,score_snapshot,supersedes_certificate_id,superseded_by_certificate_id";

export async function listCertificateRecords(
  userId: string,
  limit: number,
  offset: number,
) {
  const { data, error, count } = await getSupabaseAdmin()
    .from("academy_certificates")
    .select(certificateColumns, { count: "exact" })
    .eq("user_id", userId)
    .order("issued_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificates are unavailable.",
    );
  return {
    certificates: (data ?? []).map(mapCertificate),
    total: count ?? 0,
  };
}

export async function findOwnedCertificateRecord(
  userId: string,
  certificateId: string,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_certificates")
    .select(certificateColumns)
    .eq("id", certificateId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate could not be loaded.",
    );
  return data ? mapCertificate(data) : null;
}

export async function findCertificateRecord(certificateId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_certificates")
    .select(certificateColumns)
    .eq("id", certificateId)
    .maybeSingle();
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate could not be loaded.",
    );
  return data ? mapCertificate(data) : null;
}

export async function findActiveCertificateRecord(
  userId: string,
  courseId: string,
  courseVersion: number,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_certificates")
    .select(certificateColumns)
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("course_version", courseVersion)
    .eq("status", "issued")
    .maybeSingle();
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate status could not be checked.",
    );
  return data ? mapCertificate(data) : null;
}

export async function findExistingCertificateRecord(
  userId: string,
  courseId: string,
  courseVersion: number,
) {
  const { data, error } = await getSupabaseAdmin()
    .from("academy_certificates")
    .select(certificateColumns)
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("course_version", courseVersion)
    .order("issued_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate history could not be checked.",
    );
  return data ? mapCertificate(data) : null;
}

export async function verifyCertificateRecord(
  verificationCode: string,
): Promise<AcademyCertificateVerification | null> {
  const { data, error } = await getSupabaseAdmin().rpc(
    "verify_academy_certificate",
    { p_verification_code: verificationCode },
  );
  if (error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate verification is unavailable.",
    );
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return null;
  return {
    certificateNumber: String(row.certificate_number),
    completionDate: String(row.completion_date),
    courseTitle: String(row.course_title),
    instructorName: row.instructor_name as string | null,
    issuedAt: String(row.issued_at),
    learnerDisplayName: String(row.learner_display_name),
    status: String(row.status) as AcademyCertificateVerification["status"],
    valid: Boolean(row.valid),
  };
}
