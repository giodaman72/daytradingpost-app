import "server-only";

import {
  getRevolutApiConfig,
  REVOLUT_API_VERSION,
} from "@/lib/membership/config";

type RevolutCustomer = { id: string };
export type RevolutSubscription = {
  id: string;
  customer_id: string;
  external_reference?: string;
  plan_variation_id?: string;
  setup_order_id?: string;
  state: "pending" | "active" | "overdue" | "paused" | "cancelled" | "finished";
  current_cycle_id?: string;
  updated_at?: string;
};
type RevolutOrder = { checkout_url?: string; id: string };
type RevolutCycle = { end_date?: string; id: string };

export class RevolutApiError extends Error {
  constructor(public status: number) {
    super(`Revolut API request failed with status ${status}.`);
  }
}

async function revolutRequest<T>(
  path: string,
  init: RequestInit = {},
  idempotencyKey?: string,
) {
  const { baseUrl, secret } = getRevolutApiConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      "Revolut-Api-Version": REVOLUT_API_VERSION,
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new RevolutApiError(response.status);
  }

  return (await response.json()) as T;
}

export function createRevolutCustomer(input: {
  email: string;
  fullName: string;
}) {
  return revolutRequest<RevolutCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({ email: input.email, full_name: input.fullName }),
  });
}

export function createRevolutSubscription(input: {
  customerId: string;
  externalReference: string;
  idempotencyKey: string;
  planVariationId: string;
  redirectUrl: string;
}) {
  return revolutRequest<RevolutSubscription>(
    "/subscriptions",
    {
      method: "POST",
      body: JSON.stringify({
        customer_id: input.customerId,
        external_reference: input.externalReference,
        plan_variation_id: input.planVariationId,
        setup_order_redirect_url: input.redirectUrl,
      }),
    },
    input.idempotencyKey,
  );
}

export function getRevolutOrder(id: string) {
  return revolutRequest<RevolutOrder>(`/orders/${encodeURIComponent(id)}`);
}

export function getRevolutSubscription(id: string) {
  return revolutRequest<RevolutSubscription>(
    `/subscriptions/${encodeURIComponent(id)}`,
  );
}

export function getRevolutCycle(subscriptionId: string, cycleId: string) {
  return revolutRequest<RevolutCycle>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}/cycles/${encodeURIComponent(cycleId)}`,
  );
}
