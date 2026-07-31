import "server-only";

import { getSiteUrl } from "@/lib/membership/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { MembershipPlan } from "@/types/membership";
import { buildPurchaseConfirmationContent } from "./purchaseConfirmationContent";
import { sendTransactionalEmail } from "./resend";

type ConfirmationRequest = {
  confirmation_email_sent_at: string | null;
  id: string;
  membership_plan: MembershipPlan;
  payment_reference: string;
  payment_subscription_id: string | null;
  provider_transaction_reference: string | null;
  status: string;
  user_id: string;
  verified_at: string | null;
};

type ConfirmationProfile = {
  current_period_end: string | null;
  email: string;
  full_name: string | null;
};

export async function deliverPurchaseConfirmation(requestId: string) {
  const admin = getSupabaseAdmin();
  const { data: request, error: requestError } = await admin
    .from("membership_requests")
    .select(
      "id,user_id,membership_plan,status,payment_reference,payment_subscription_id,provider_transaction_reference,verified_at,confirmation_email_sent_at",
    )
    .eq("id", requestId)
    .maybeSingle<ConfirmationRequest>();

  if (requestError) throw requestError;
  if (!request) throw new Error("Membership request not found.");
  if (request.status !== "verified" || !request.verified_at)
    throw new Error("The purchase has not been verified.");
  if (request.confirmation_email_sent_at)
    return { alreadySent: true, emailId: null };

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("email,full_name,current_period_end")
    .eq("id", request.user_id)
    .maybeSingle<ConfirmationProfile>();

  if (profileError) throw profileError;
  if (!profile?.email) throw new Error("The buyer email address is missing.");

  const providerReference =
    request.provider_transaction_reference ||
    request.payment_subscription_id ||
    request.payment_reference;
  const content = buildPurchaseConfirmationContent({
    accountUrl: `${getSiteUrl()}/account/billing`,
    buyerName: profile.full_name,
    currentPeriodEnd: profile.current_period_end,
    providerReference,
    plan: request.membership_plan,
    verifiedAt: request.verified_at,
  });
  const emailId = await sendTransactionalEmail({
    ...content,
    idempotencyKey: `purchase-confirmation-${request.id}`,
    to: profile.email,
  });

  const { error: updateError } = await admin
    .from("membership_requests")
    .update({
      confirmation_email_id: emailId,
      confirmation_email_sent_at: new Date().toISOString(),
    })
    .eq("id", request.id)
    .is("confirmation_email_sent_at", null);
  if (updateError) throw updateError;

  return { alreadySent: false, emailId };
}
