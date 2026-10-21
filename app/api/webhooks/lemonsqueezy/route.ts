import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { deliverPurchaseConfirmation } from "@/lib/email/purchaseConfirmation";
import {
  getLemonSqueezySubscription,
  type LemonSqueezySubscriptionAttributes,
} from "@/lib/lemonsqueezy/client";
import {
  LEMONSQUEEZY_SUBSCRIPTION_EVENTS,
  mapLemonSqueezySubscription,
  verifyLemonSqueezySignature,
} from "@/lib/lemonsqueezy/webhook";
import { getPlanForLemonSqueezyVariant } from "@/lib/membership/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type WebhookPayload = {
  meta?: { event_name?: string; custom_data?: Record<string, unknown> };
  data?: {
    id?: string | number;
    type?: string;
    attributes?: LemonSqueezySubscriptionAttributes;
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim();

  if (!secret) {
    console.error("Lemon Squeezy webhook secret is not configured.");
    return NextResponse.json({ error: "Webhook unavailable" }, { status: 503 });
  }

  if (
    !verifyLemonSqueezySignature({
      rawBody,
      secret,
      signature: request.headers.get("X-Signature"),
    })
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const eventName = payload.meta?.event_name || "unknown";
  const eventKey = createHash("sha256").update(rawBody).digest("hex");
  const admin = getSupabaseAdmin();
  const { error: insertError } = await admin
    .from("payment_webhook_events")
    .insert({ event_key: eventKey, event_type: `lemonsqueezy:${eventName}` });

  if (insertError?.code === "23505") {
    return NextResponse.json({ received: true, duplicate: true });
  }
  if (insertError) {
    console.error(
      "Unable to register Lemon Squeezy webhook event:",
      insertError.message,
    );
    return NextResponse.json(
      { error: "Webhook storage unavailable" },
      { status: 503 },
    );
  }

  const markProcessed = () =>
    admin
      .from("payment_webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("event_key", eventKey);

  try {
    if (
      !LEMONSQUEEZY_SUBSCRIPTION_EVENTS.has(eventName) ||
      payload.data?.type !== "subscriptions"
    ) {
      await markProcessed();
      return NextResponse.json({ received: true, ignored: true });
    }

    const subscriptionId = String(payload.data.id ?? "");
    if (!/^\d{1,20}$/.test(subscriptionId)) {
      throw new Error("Subscription event did not include an identifier.");
    }

    // Events can arrive out of order; read the subscription's current state.
    let attributes = payload.data.attributes;
    try {
      attributes = (await getLemonSqueezySubscription(subscriptionId))
        .attributes;
    } catch (error) {
      console.warn(
        "Using the webhook copy of the Lemon Squeezy subscription:",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
    if (!attributes) throw new Error("Subscription event had no attributes.");

    const { data: bySubscription, error: lookupError } = await admin
      .from("membership_requests")
      .select("id,user_id,membership_plan")
      .eq("payment_subscription_id", subscriptionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lookupError) throw lookupError;

    let membershipRequest = bySubscription;
    const reference = payload.meta?.custom_data?.payment_reference;
    if (
      !membershipRequest &&
      typeof reference === "string" &&
      UUID.test(reference)
    ) {
      const { data, error } = await admin
        .from("membership_requests")
        .select("id,user_id,membership_plan")
        .eq("payment_reference", reference)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      membershipRequest = data;
    }

    if (!membershipRequest) {
      throw new Error(
        "No membership request matches the Lemon Squeezy subscription.",
      );
    }

    const mapped = mapLemonSqueezySubscription(attributes);
    const membershipPlan =
      getPlanForLemonSqueezyVariant(attributes.variant_id) ||
      membershipRequest.membership_plan;
    const verifiedAt =
      mapped.membershipStatus === "active" ? new Date().toISOString() : null;

    const { error: profileError } = await admin
      .from("profiles")
      .update({
        membership_plan: membershipPlan,
        membership_status: mapped.membershipStatus,
        payment_customer_id: String(attributes.customer_id),
        payment_provider: "lemonsqueezy",
        payment_subscription_id: subscriptionId,
        current_period_end: mapped.currentPeriodEnd,
        ...(verifiedAt ? { payment_verified_at: verifiedAt } : {}),
      })
      .eq("id", membershipRequest.user_id);
    if (profileError) throw profileError;

    const { error: requestError } = await admin
      .from("membership_requests")
      .update({
        payment_subscription_id: subscriptionId,
        provider_transaction_reference: `lemonsqueezy-${subscriptionId}`,
        status: mapped.requestStatus,
        ...(verifiedAt ? { verified_at: verifiedAt } : {}),
      })
      .eq("id", membershipRequest.id);
    if (requestError) throw requestError;

    if (mapped.requestStatus === "verified") {
      try {
        await deliverPurchaseConfirmation(membershipRequest.id);
      } catch (error) {
        console.error(
          "Membership activated but purchase confirmation email failed:",
          error instanceof Error ? error.message : "Unknown email error",
        );
      }
    }

    await markProcessed();
    revalidatePath("/account/billing");
    revalidatePath("/analysis");
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      "Lemon Squeezy webhook processing failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    // Forget the event so Lemon Squeezy's retry is processed again.
    await admin
      .from("payment_webhook_events")
      .delete()
      .eq("event_key", eventKey);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
