import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verifyOtp: vi.fn(),
  isSupabaseAuthConfigured: vi.fn(() => true),
}));

vi.mock("@/lib/supabase/config", () => ({
  isSupabaseAuthConfigured: mocks.isSupabaseAuthConfigured,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { verifyOtp: mocks.verifyOtp },
  })),
}));

import { GET } from "./route";

describe("email confirmation route", () => {
  beforeEach(() => {
    mocks.verifyOtp.mockReset();
    mocks.isSupabaseAuthConfigured.mockReturnValue(true);
  });

  it("opens the password form after verifying a recovery token", async () => {
    mocks.verifyOtp.mockResolvedValue({ error: null });

    const response = await GET(
      new NextRequest(
        "https://daytradingpost.test/auth/confirm?token_hash=secure-hash&type=recovery",
      ),
    );

    expect(mocks.verifyOtp).toHaveBeenCalledWith({
      token_hash: "secure-hash",
      type: "recovery",
    });
    expect(response.headers.get("location")).toBe(
      "https://daytradingpost.test/reset-password",
    );
  });

  it("opens the account after verifying a signup token", async () => {
    mocks.verifyOtp.mockResolvedValue({ error: null });

    const response = await GET(
      new NextRequest(
        "https://daytradingpost.test/auth/confirm?token_hash=secure-hash&type=email",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://daytradingpost.test/account",
    );
  });

  it("rejects unsupported token types without calling Supabase", async () => {
    const response = await GET(
      new NextRequest(
        "https://daytradingpost.test/auth/confirm?token_hash=secure-hash&type=magiclink",
      ),
    );

    expect(mocks.verifyOtp).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toContain("/login?error=");
  });
});
