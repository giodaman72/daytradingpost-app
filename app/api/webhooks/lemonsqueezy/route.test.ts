import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "whsec_route_test";
const REFERENCE = "11111111-2222-4333-8444-555555555555";

type Call = { table: string; op: string; values?: unknown; filters: unknown[] };
const calls: Call[] = [];
let requestRow: { id: string; user_id: string; membership_plan: string } | null;

function table(name: string) {
  const call: Call = { table: name, op: "select", filters: [] };
  const builder = {
    insert(values: unknown) {
      calls.push({ table: name, op: "insert", values, filters: [] });
      return Promise.resolve({ error: null });
    },
    update(values: unknown) {
      call.op = "update";
      call.values = values;
      calls.push(call);
      return builder;
    },
    delete() {
      call.op = "delete";
      calls.push(call);
      return builder;
    },
    select() {
      return builder;
    },
    eq(column: string, value: unknown) {
      call.filters.push([column, value]);
      return builder;
    },
    is() {
      return builder;
    },
    order() {
      return builder;
    },
    limit() {
      return builder;
    },
    maybeSingle() {
      const bySubscription = call.filters.some(
        (f) => (f as unknown[])[0] === "payment_subscription_id",
      );
      return Promise.resolve({
        data: bySubscription ? null : requestRow,
        error: null,
      });
    },
    then(resolve: (v: { error: null }) => void) {
      resolve({ error: null });
    },
  };
  return builder;
}

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({ from: table }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
const deliver = vi.fn(async (_requestId: string) => ({
  alreadySent: false,
  emailId: "e1",
}));
vi.mock("@/lib/email/purchaseConfirmation", () => ({
  deliverPurchaseConfirmation: (id: string) => deliver(id),
}));
vi.mock("@/lib/lemonsqueezy/client", () => ({
  getLemonSqueezySubscription: vi.fn(async () => {
    throw new Error("offline");
  }),
}));

function event(name: string, attributes: Record<string, unknown>) {
  return JSON.stringify({
    meta: {
      event_name: name,
      custom_data: { user_id: "user-1", payment_reference: REFERENCE },
    },
    data: { type: "subscriptions", id: "987", attributes },
  });
}

function post(
  body: string,
  signature = createHmac("sha256", SECRET).update(body).digest("hex"),
) {
  return new Request("https://daytradingpost.com/api/webhooks/lemonsqueezy", {
    method: "POST",
    headers: { "X-Signature": signature },
    body,
  });
}

describe("Lemon Squeezy webhook", () => {
  beforeEach(() => {
    calls.length = 0;
    deliver.mockClear();
    requestRow = { id: "req-1", user_id: "user-1", membership_plan: "monthly" };
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = SECRET;
    process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID = "111";
    process.env.LEMONSQUEEZY_ANNUAL_VARIANT_ID = "222";
  });

  it("rejects an unsigned request", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      post(event("subscription_created", {}), "0".repeat(64)),
    );
    expect(response.status).toBe(401);
    expect(calls).toHaveLength(0);
  });

  it("activates the member for a new annual subscription", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      post(
        event("subscription_created", {
          status: "active",
          variant_id: 222,
          customer_id: 555,
          renews_at: "2027-10-20T00:00:00.000Z",
        }),
      ),
    );

    expect(response.status).toBe(200);
    const profile = calls.find(
      (c) => c.table === "profiles" && c.op === "update",
    );
    expect(profile?.values).toMatchObject({
      membership_plan: "annual",
      membership_status: "active",
      payment_provider: "lemonsqueezy",
      payment_customer_id: "555",
      payment_subscription_id: "987",
      current_period_end: "2027-10-20T00:00:00.000Z",
    });
    expect(profile?.filters).toContainEqual(["id", "user-1"]);
    const request = calls.find(
      (c) => c.table === "membership_requests" && c.op === "update",
    );
    expect(request?.values).toMatchObject({ status: "verified" });
    expect(deliver).toHaveBeenCalledWith("req-1");
  });

  it("ends access when the subscription expires", async () => {
    const { POST } = await import("./route");
    await POST(
      post(
        event("subscription_expired", {
          status: "expired",
          variant_id: 111,
          customer_id: 555,
          ends_at: "2026-11-20T00:00:00.000Z",
        }),
      ),
    );
    const profile = calls.find(
      (c) => c.table === "profiles" && c.op === "update",
    );
    expect(profile?.values).toMatchObject({ membership_status: "cancelled" });
    expect(deliver).not.toHaveBeenCalled();
  });

  it("ignores order events and returns 500 when no member matches", async () => {
    const { POST } = await import("./route");
    const ignored = await POST(
      post(
        JSON.stringify({
          meta: { event_name: "order_created" },
          data: { type: "orders", id: "1" },
        }),
      ),
    );
    expect(await ignored.json()).toMatchObject({ ignored: true });

    requestRow = null;
    const missing = await POST(
      post(
        event("subscription_updated", {
          status: "active",
          variant_id: 111,
          customer_id: 1,
        }),
      ),
    );
    expect(missing.status).toBe(500);
    expect(
      calls.some(
        (c) => c.table === "payment_webhook_events" && c.op === "delete",
      ),
    ).toBe(true);
  });
});
