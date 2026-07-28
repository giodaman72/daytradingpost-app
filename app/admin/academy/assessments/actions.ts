"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAcademyPermission } from "@/lib/academy/admin/academyAdminAuthorization";
import { AcademyError } from "@/lib/academy/academyErrors";
import {
  normalizePlainText,
  parseAcademyIdentifier,
} from "@/lib/academy/academyValidation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function invalidateAssessmentAttemptAction(formData: FormData) {
  const actor = await requireAcademyPermission("academy:manage-assessments");
  if (String(formData.get("confirmation")) !== "INVALIDATE")
    throw new AcademyError(
      "ACADEMY_VALIDATION_FAILED",
      'Type "INVALIDATE" to confirm.',
    );
  const { error } = await getSupabaseAdmin().rpc(
    "admin_invalidate_academy_attempt",
    {
      p_actor_user_id: actor.userId,
      p_attempt_id: parseAcademyIdentifier(
        formData.get("attemptId"),
        "attempt ID",
      ),
      p_reason: normalizePlainText(formData.get("reason"), "Reason", 500),
      p_request_id: crypto.randomUUID(),
    },
  );
  if (error) redirect("/admin/academy/assessments?notice=invalidate-failed");
  revalidatePath("/admin/academy/assessments");
  redirect("/admin/academy/assessments?notice=invalidated");
}
