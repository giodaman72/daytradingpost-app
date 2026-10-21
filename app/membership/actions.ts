"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import {
  getLemonSqueezyVariantId,
  getPaymentLink,
  getPaymentProviderMode,
  getPlanVariationId,
  getSiteUrl,
} from "@/lib/membership/config";
import { hasActiveMembership } from "@/lib/payments/membershipStatus";
import { createLemonSqueezyCheckout } from "@/lib/lemonsqueezy/client";
import {
  createRevolutCustomer,
  createRevolutSubscription,
  getRevolutOrder,
} from "@/lib/revolut/client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { MembershipPlan } from "@/types/membership";

export type CheckoutState = { error: string | null };

function parsePlan(value: FormDataEntryValue | null): MembershipPlan | null {
  return value === "monthly" || value === "annual" ? value : null;
}

export async function startMembershipCheckout(
  _previousState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const plan = parsePlan(formData.get("plan"));
  if (!plan) return { error: "Choose a valid membership plan." };

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) redirect(`/login?next=${encodeURIComponent("/premium")}`);

  const admin = getSupabaseAdmin();
  const mode = getPaymentProviderMode();
  const paymentReference = randomUUID();
  let requestId: string | null = null;
  let redirectTo: string | null = null;

  try {
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select(
        "email,full_name,membership_status,payment_customer_id,payment_verified_at,current_period_end",
      )
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;
    if (hasActiveMembership(profile)) {
      redirectTo = "/account/billing";
    }

    if (!redirectTo) {
      const { data: membershipRequest, error: requestError } = await admin
        .from("membership_requests")
        .insert({
          user_id: user.id,
          membership_plan: plan,
          provider_mode: mode,
          payment_reference: paymentReference,
          status: "pending",
        })
        .select("id")
        .single();

      if (requestError) throw requestError;
      requestId = membershipRequest.id;

      const pendingProfile = {
        membership_status: "pending",
        membership_plan: plan,
        payment_provider: mode === "lemonsqueezy" ? "lemonsqueezy" : "revolut",
        payment_reference: paymentReference,
        payment_subscription_id: null,
        payment_verified_at: null,
      };

      if (mode === "lemonsqueezy") {
        const variantId = getLemonSqueezyVariantId(plan);
        if (!variantId)
          throw new Error("The selected Lemon Squeezy plan is not configured.");

        const customerEmail = profile.email || user.email;
        if (!customerEmail) {
          throw new Error(
            "The authenticated account does not have an email address.",
          );
        }

        const checkoutUrl = await createLemonSqueezyCheckout({
          variantId,
          email: customerEmail,
          name: profile.full_name,
          custom: { user_id: user.id, payment_reference: paymentReference },
          redirectUrl: `${getSiteUrl()}/membership/success?reference=${paymentReference}`,
        });

        // The profile is left as it is: Lemon Squeezy's webhook sets the
        // membership once payment succeeds, so an abandoned checkout never
        // leaves the account stuck on "Pending".
        redirectTo = checkoutUrl;
      } else if (mode === "revolut_payment_links") {
        const paymentLink = getPaymentLink(plan);
        if (!paymentLink)
          throw new Error(
            "The selected Revolut payment link is not configured.",
          );

        const { error } = await admin
          .from("profiles")
          .update(pendingProfile)
          .eq("id", user.id);
        if (error) throw error;
        redirectTo = paymentLink;
      } else {
        const planVariationId = getPlanVariationId(plan);
        if (!planVariationId)
          throw new Error("The selected Revolut plan is not configured.");

        let customerId = profile.payment_customer_id as string | null;
        if (!customerId) {
          const customerEmail = profile.email || user.email;
          if (!customerEmail) {
            throw new Error(
              "The authenticated account does not have an email address.",
            );
          }

          const customer = await createRevolutCustomer({
            email: customerEmail,
            fullName:
              profile.full_name ||
              user.email?.split("@")[0] ||
              "DayTradingPost member",
          });
          customerId = customer.id;

          const { error: customerUpdateError } = await admin
            .from("profiles")
            .update({ payment_customer_id: customerId })
            .eq("id", user.id);
          if (customerUpdateError) throw customerUpdateError;
        }

        const subscription = await createRevolutSubscription({
          customerId,
          externalReference: paymentReference,
          idempotencyKey: paymentReference,
          planVariationId,
          redirectUrl: `${getSiteUrl()}/membership/success?reference=${paymentReference}`,
        });

        if (!subscription.setup_order_id) {
          throw new Error("Revolut did not return a subscription setup order.");
        }

        const order = await getRevolutOrder(subscription.setup_order_id);
        if (!order.checkout_url)
          throw new Error("Revolut did not return a checkout URL.");

        const { error: requestUpdateError } = await admin
          .from("membership_requests")
          .update({ payment_subscription_id: subscription.id })
          .eq("id", requestId);
        if (requestUpdateError) throw requestUpdateError;

        const { error: profileUpdateError } = await admin
          .from("profiles")
          .update({
            ...pendingProfile,
            payment_customer_id: customerId,
            payment_subscription_id: subscription.id,
          })
          .eq("id", user.id);
        if (profileUpdateError) throw profileUpdateError;

        redirectTo = order.checkout_url;
      }
    }
  } catch (error) {
    console.error(
      "Membership checkout failed:",
      error instanceof Error ? error.message : "Unknown checkout error",
    );

    if (requestId) {
      await admin
        .from("membership_requests")
        .update({ status: "failed" })
        .eq("id", requestId);
    }

    return {
      error:
        error instanceof Error && error.message.includes("not configured")
          ? error.message
          : "Checkout could not be started. Please try again or contact support.",
    };
  }

  if (redirectTo) redirect(redirectTo);
  return { error: "Checkout could not be started." };
}
