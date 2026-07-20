import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AcademyCertificate } from "@/types/academy";
import { requireAcademyPermission } from "./academyAdminAuthorization";
import { AcademyError } from "../academyErrors";
import { mapCertificate } from "../certificates/certificateRepository";

export async function getCertificateAdminDashboard() {
  await requireAcademyPermission("academy:manage-certificates");
  const [certificateResult, auditResult] = await Promise.all([
    getSupabaseAdmin()
      .from("academy_certificates")
      .select("*")
      .order("issued_at", { ascending: false })
      .limit(500),
    getSupabaseAdmin()
      .from("academy_admin_audit")
      .select(
        "id,actor_user_id,action,target_type,target_id,metadata,created_at",
      )
      .eq("target_type", "academy_certificate")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  if (certificateResult.error || auditResult.error)
    throw new AcademyError(
      "ACADEMY_PROVIDER_UNAVAILABLE",
      "Certificate administration is unavailable.",
    );
  return {
    audit: (auditResult.data ?? []).map((row) => ({
      action: String(row.action),
      actorUserId: row.actor_user_id ? String(row.actor_user_id) : null,
      createdAt: String(row.created_at),
      id: String(row.id),
      metadata:
        row.metadata && typeof row.metadata === "object" ? row.metadata : {},
      targetId: String(row.target_id),
    })),
    certificates: (certificateResult.data ?? []).map(
      mapCertificate,
    ) as AcademyCertificate[],
  };
}
