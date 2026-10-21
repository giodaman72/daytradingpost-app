import "server-only";

import { getLemonSqueezyConfig } from "@/lib/membership/config";

const API_BASE = "https://api.lemonsqueezy.com/v1";

export type LemonSqueezySubscriptionStatus =
  | "on_trial"
  | "active"
  | "paused"
  | "past_due"
  | "unpaid"
  | "cancelled"
  | "expired";

export type LemonSqueezySubscriptionAttributes = {
  status: LemonSqueezySubscriptionStatus;
  variant_id: number;
  customer_id: number;
  user_email?: string;
  renews_at?: string | null;
  ends_at?: string | null;
  urls?: {
    customer_portal?: string | null;
    update_payment_method?: string | null;
  };
};

export class LemonSqueezyApiError extends Error {
  constructor(
    public status: number,
    public detail?: string,
  ) {
    super(
      `Lemon Squeezy API request failed with status ${status}${detail ? `: ${detail}` : "."}`,
    );
  }
}

/**
 * Lemon Squeezy's JSON:API error text (e.g. which store or variant was not
 * found), trimmed for logs. Never includes request headers or the API key.
 */
async function readErrorDetail(response: Response, path: string) {
  try {
    const body = (await response.json()) as {
      errors?: Array<{ title?: string; detail?: string }>;
    };
    const first = body.errors?.[0];
    const text = [first?.title, first?.detail].filter(Boolean).join(" - ");
    return `${path.split("/")[1]} request: ${text || "no error detail"}`.slice(
      0,
      300,
    );
  } catch {
    return `${path.split("/")[1]} request: no error detail`;
  }
}

async function lemonSqueezyRequest<T>(path: string, init: RequestInit = {}) {
  const { apiKey } = getLemonSqueezyConfig();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new LemonSqueezyApiError(
      response.status,
      await readErrorDetail(response, path),
    );
  }
  return (await response.json()) as T;
}

/**
 * Creates a hosted checkout for one subscription variant and returns its URL.
 * `custom` comes back on every webhook for the resulting subscription as
 * `meta.custom_data`, which is how the webhook finds the member.
 */
export async function createLemonSqueezyCheckout(input: {
  variantId: string;
  email: string;
  name?: string | null;
  custom: Record<string, string>;
  redirectUrl: string;
}) {
  const { storeId, testMode } = getLemonSqueezyConfig();
  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email: input.email,
          ...(input.name ? { name: input.name } : {}),
          custom: input.custom,
        },
        product_options: {
          redirect_url: input.redirectUrl,
          enabled_variants: [Number(input.variantId)],
        },
        checkout_options: { embed: false },
        test_mode: testMode,
      },
      relationships: {
        store: { data: { type: "stores", id: storeId } },
        variant: { data: { type: "variants", id: input.variantId } },
      },
    },
  };

  const result = await lemonSqueezyRequest<{
    data?: { attributes?: { url?: string } };
  }>("/checkouts", { method: "POST", body: JSON.stringify(body) });

  const url = result.data?.attributes?.url;
  if (!url) throw new Error("Lemon Squeezy did not return a checkout URL.");
  return url;
}

export async function getLemonSqueezySubscription(subscriptionId: string) {
  if (!/^\d{1,20}$/.test(subscriptionId)) {
    throw new Error("Invalid Lemon Squeezy subscription id.");
  }
  const result = await lemonSqueezyRequest<{
    data?: { id: string; attributes: LemonSqueezySubscriptionAttributes };
  }>(`/subscriptions/${subscriptionId}`);
  if (!result.data) throw new Error("Lemon Squeezy subscription not found.");
  return result.data;
}
