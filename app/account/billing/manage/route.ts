import { NextResponse } from "next/server";
import { getLemonSqueezySubscription } from "@/lib/lemonsqueezy/client";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sends a signed-in member to their Lemon Squeezy customer portal. The portal
 * link is signed and expires after 24 hours, so it is fetched on each click.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const billing = new URL("/account/billing", origin);

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent("/account/billing")}`, origin),
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("payment_provider,payment_subscription_id")
    .eq("id", authData.user.id)
    .maybeSingle();

  const subscriptionId = profile?.payment_subscription_id as string | null;
  if (profile?.payment_provider !== "lemonsqueezy" || !subscriptionId) {
    return NextResponse.redirect(billing);
  }

  try {
    const subscription = await getLemonSqueezySubscription(subscriptionId);
    const portal = subscription.attributes.urls?.customer_portal;
    if (portal && new URL(portal).protocol === "https:") {
      return NextResponse.redirect(portal);
    }
  } catch (error) {
    console.error(
      "Unable to open the Lemon Squeezy customer portal:",
      error instanceof Error ? error.message : "Unknown error",
    );
  }

  billing.searchParams.set("manage", "unavailable");
  return NextResponse.redirect(billing);
}
