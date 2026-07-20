import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { insertNotification } from "./notificationRepository";

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: vi.fn(),
}));

describe("notification idempotency", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the existing notification after a duplicate-key retry", async () => {
    const existing = {
      created_at: "2026-07-20T00:00:00Z",
      dismissed_at: null,
      expires_at: null,
      id: "notification-1",
      link: "/academy/certificates/certificate-1",
      message: "Certificate issued.",
      metadata: {},
      notification_type: "academy_certificate_issued",
      read_at: null,
      severity: "success",
      title: "Certificate issued",
      user_id: "user-1",
    };
    const insertChain = {
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: "23505" },
      }),
    };
    insertChain.insert.mockReturnValue(insertChain);
    insertChain.select.mockReturnValue(insertChain);
    const lookupChain = {
      eq: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: existing, error: null }),
      select: vi.fn(),
    };
    lookupChain.select.mockReturnValue(lookupChain);
    lookupChain.eq.mockReturnValue(lookupChain);
    vi.mocked(getSupabaseAdmin)
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue(insertChain),
      } as never)
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue(lookupChain),
      } as never);

    const result = await insertNotification({
      idempotencyKey: "certificate:1",
      message: "Certificate issued.",
      notificationType: "academy_certificate_issued",
      title: "Certificate issued",
      userId: "user-1",
    });
    expect(result.id).toBe("notification-1");
    expect(lookupChain.eq).toHaveBeenCalledWith(
      "idempotency_key",
      "certificate:1",
    );
  });
});
