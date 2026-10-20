import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ insert: vi.fn() }));

vi.mock("@/lib/supabase-newsletter", () => ({
  insertNewsletterSubscriber: mocks.insert,
}));

import { POST } from "./route";

let clientCounter = 0;

function signup(body: Record<string, unknown>) {
  clientCounter += 1;
  return POST(
    new Request("https://daytradingpost.test/api/newsletter", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `203.0.113.${clientCounter}`,
      },
      body: JSON.stringify(body),
    }),
  );
}

describe("newsletter signup API", () => {
  beforeEach(() => {
    mocks.insert.mockReset();
    mocks.insert.mockResolvedValue("created");
  });

  it("stores a consented signup with the page it came from", async () => {
    const response = await signup({
      email: "Trader@Example.com",
      consent: true,
      source: "article",
    });

    expect(response.status).toBe(201);
    expect(mocks.insert).toHaveBeenCalledWith("trader@example.com", "article");
  });

  it("falls back to the homepage source for unknown values", async () => {
    await signup({
      email: "trader@example.com",
      consent: true,
      source: "<script>",
    });

    expect(mocks.insert).toHaveBeenCalledWith("trader@example.com", "homepage");
  });

  it("requires consent", async () => {
    const response = await signup({ email: "trader@example.com" });

    expect(response.status).toBe(400);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("quietly accepts but never stores honeypot submissions", async () => {
    const response = await signup({
      email: "bot@example.com",
      consent: true,
      company: "Bot Inc",
    });

    expect(response.status).toBe(200);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("reports an existing subscriber without an error", async () => {
    mocks.insert.mockResolvedValue("duplicate");

    const response = await signup({
      email: "trader@example.com",
      consent: true,
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
  });
});
