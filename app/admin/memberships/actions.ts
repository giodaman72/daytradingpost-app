"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/adminAuthorization";
import { deliverPurchaseConfirmation } from "@/lib/email/purchaseConfirmation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type MembershipRequestRow = {
  id: string;
  provider_mode: string;
  status: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TRANSACTION_REFERENCE_PATTERN = /^[0-9a-z][0-9a-z ._/#-]{2,199}$/i;

function adminRedirect(status: string): never {
  revalidatePath("/admin/memberships");
  revalidatePath("/account/billing");
  revalidatePath("/premium");
  redirect(`/admin/memberships?status=${encodeURIComponent(status)}`);
}

export async function confirmMembershipPayment(
  requestId: string,
  formData: FormData,
) {
  const access = await requireAdmin();
  if (!UUID_PATTERN.test(requestId)) adminRedirect("request-not-found");

  const transactionReference = String(
    formData.get("transactionReference") || "",
  ).trim();
  if (!TRANSACTION_REFERENCE_PATTERN.test(transactionReference))
    adminRedirect("invalid-transaction-reference");

  const admin = getSupabaseAdmin();
  const { data: request, error: requestError } = await admin
    .from("membership_requests")
    .select("id,status,provider_mode")
    .eq("id", requestId)
    .maybeSingle<MembershipRequestRow>();

  if (requestError || !request) adminRedirect("request-not-found");
  if (
    request.status !== "pending" ||
    request.provider_mode !== "revolut_payment_links"
  )
    adminRedirect("request-not-pending");

  const { error: verifyError } = await admin.rpc("verify_membership_request", {
    approve: true,
    notes: `Verified against Revolut transaction ${transactionReference}`,
    operator_id: access.user.id,
    provider_reference: transactionReference,
    request_id: request.id,
  });
  if (verifyError) {
    console.error("Membership verification failed:", verifyError.code);
    adminRedirect("verification-failed");
  }

  try {
    await deliverPurchaseConfirmation(request.id);
  } catch (error) {
    console.error(
      "Purchase verified but confirmation email failed:",
      error instanceof Error ? error.message : "Unknown email error",
    );
    adminRedirect("confirmed-email-failed");
  }

  adminRedirect("confirmed-email-sent");
}

export async function retryPurchaseConfirmation(requestId: string) {
  await requireAdmin();
  if (!UUID_PATTERN.test(requestId)) adminRedirect("request-not-found");

  try {
    const result = await deliverPurchaseConfirmation(requestId);
    adminRedirect(result.alreadySent ? "email-already-sent" : "email-sent");
  } catch (error) {
    console.error(
      "Purchase confirmation retry failed:",
      error instanceof Error ? error.message : "Unknown email error",
    );
    adminRedirect("email-failed");
  }
}
