import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getPlanVariationId } from "@/lib/membership/config";
import type { MembershipPlan, MembershipStatus } from "@/types/membership";
import {
  getRevolutCycle,
  getRevolutSubscription,
  type RevolutSubscription,
} from "@/lib/revolut/client";
import { verifyRevolutWebhook } from "@/lib/revolut/webhook";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const subscriptionEvents = new Set([
  "SUBSCRIPTION_INITIATED",
  "SUBSCRIPTION_FINISHED",
  "SUBSCRIPTION_CANCELLED",
  "SUBSCRIPTION_OVERDUE",
]);

function stringValue(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function getSubscriptionId(payload: Record<string, unknown>) {
  const data =
    payload.data && typeof payload.data === "object"
      ? (payload.data as Record<string, unknown>)
      : {};

  return (
    stringValue(payload.subscription_id) ||
    stringValue(data.subscription_id) ||
    stringValue(data.id)
  );
}

function mapStatus(state: RevolutSubscription["state"]): MembershipStatus {
  switch (state) {
    case "active":
      return "active";
    case "overdue":
    case "paused":
      return "past_due";
    case "cancelled":
    case "finished":
      return "cancelled";
    default:
      return "pending";
  }
}

function mapRequestStatus(state: RevolutSubscription["state"]) {
  if (state === "active") return "verified";
  if (state === "cancelled" || state === "finished") return "cancelled";
  if (state === "overdue" || state === "paused") return "failed";
  return "pending";
}

function getPlan(subscription: RevolutSubscription): MembershipPlan | null {
  if (subscription.plan_variation_id === getPlanVariationId("monthly")) return "monthly";
  if (subscription.plan_variation_id === getPlanVariationId("annual")) return "annual";
  return null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.REVOLUT_WEBHOOK_SECRET?.trim();

  if (!secret) {
    console.error("Revolut webhook secret is not configured.");
    return NextResponse.json({ error: "Webhook unavailable" }, { status: 503 });
  }

  const valid = verifyRevolutWebhook({
    rawBody,
    secret,
    signature: request.headers.get("Revolut-Signature"),
    timestamp: request.headers.get("Revolut-Request-Timestamp"),
  });

  if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const eventType = stringValue(payload.event) || "UNKNOWN";
  const eventKey = createHash("sha256").update(rawBody).digest("hex");
  const admin = getSupabaseAdmin();
  const { error: insertError } = await admin.from("payment_webhook_events").insert({
    event_key: eventKey,
    event_type: eventType,
  });

  if (insertError?.code === "23505") {
    return NextResponse.json({ received: true, duplicate: true });
  }
  if (insertError) {
    console.error("Unable to register Revolut webhook event:", insertError.message);
    return NextResponse.json({ error: "Webhook storage unavailable" }, { status: 503 });
  }

  try {
    if (!subscriptionEvents.has(eventType)) {
      await admin
        .from("payment_webhook_events")
        .update({ processed_at: new Date().toISOString() })
        .eq("event_key", eventKey);
      return NextResponse.json({ received: true, ignored: true });
    }

    const subscriptionId = getSubscriptionId(payload);
    if (!subscriptionId) throw new Error("Subscription event did not include an identifier.");

    const subscription = await getRevolutSubscription(subscriptionId);
    const { data: requestBySubscription, error: subscriptionLookupError } = await admin
      .from("membership_requests")
      .select("id,user_id,membership_plan")
      .eq("payment_subscription_id", subscription.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionLookupError) throw subscriptionLookupError;

    let membershipRequest = requestBySubscription;
    if (!membershipRequest && subscription.external_reference) {
      const { data, error } = await admin
        .from("membership_requests")
        .select("id,user_id,membership_plan")
        .eq("payment_reference", subscription.external_reference)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      membershipRequest = data;
    }

    if (!membershipRequest) {
      throw new Error("No membership request matches the Revolut subscription.");
    }

    let currentPeriodEnd: string | null = null;
    if (subscription.current_cycle_id) {
      try {
        const cycle = await getRevolutCycle(subscription.id, subscription.current_cycle_id);
        currentPeriodEnd = cycle.end_date || null;
      } catch (error) {
        console.warn(
          "Unable to retrieve the Revolut subscription cycle:",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    }

    const membershipStatus = mapStatus(subscription.state);
    const membershipPlan = getPlan(subscription) || membershipRequest.membership_plan;
    const verifiedAt = membershipStatus === "active" ? new Date().toISOString() : null;
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        membership_plan: membershipPlan,
        membership_status: membershipStatus,
        payment_customer_id: subscription.customer_id,
        payment_provider: "revolut",
        ...(subscription.external_reference
          ? { payment_reference: subscription.external_reference }
          : {}),
        payment_subscription_id: subscription.id,
        ...(currentPeriodEnd ? { current_period_end: currentPeriodEnd } : {}),
        ...(verifiedAt ? { payment_verified_at: verifiedAt } : {}),
      })
      .eq("id", membershipRequest.user_id);
    if (profileError) throw profileError;

    const requestStatus = mapRequestStatus(subscription.state);
    const { error: membershipRequestError } = await admin
      .from("membership_requests")
      .update({
        payment_subscription_id: subscription.id,
        status: requestStatus,
        ...(verifiedAt ? { verified_at: verifiedAt } : {}),
      })
      .eq("id", membershipRequest.id);
    if (membershipRequestError) throw membershipRequestError;

    await admin
      .from("payment_webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("event_key", eventKey);

    revalidatePath("/account/billing");
    revalidatePath("/analysis");
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      "Revolut webhook processing failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    await admin.from("payment_webhook_events").delete().eq("event_key", eventKey);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
