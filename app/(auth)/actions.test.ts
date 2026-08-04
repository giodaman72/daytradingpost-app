import { beforeEach, describe, expect, it, vi } from "vitest";
import { initialAuthState } from "@/lib/validation/auth";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(
    async () =>
      new Headers({
        host: "daytradingpost.test",
        "x-forwarded-proto": "https",
      }),
  ),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

vi.mock("@/lib/supabase/config", () => ({
  isSupabaseAuthConfigured: vi.fn(() => true),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { signUp: mocks.signUp } })),
}));

import { registerAction } from "./actions";

function registrationForm(locale?: string) {
  const formData = new FormData();
  formData.set("fullName", "María Trader");
  formData.set("email", "maria@example.com");
  formData.set("password", "secure-password");
  formData.set("confirmPassword", "secure-password");
  if (locale) formData.set("locale", locale);
  return formData;
}

describe("registration confirmation locale", () => {
  beforeEach(() => {
    mocks.redirect.mockReset();
    mocks.signUp.mockReset();
    mocks.signUp.mockResolvedValue({ data: { session: null }, error: null });
  });

  it("stores Spanish language metadata for the Supabase email template", async () => {
    const result = await registerAction(
      initialAuthState,
      registrationForm("es"),
    );

    expect(mocks.signUp).toHaveBeenCalledWith({
      email: "maria@example.com",
      password: "secure-password",
      options: {
        data: { full_name: "María Trader", language: "es" },
        emailRedirectTo:
          "https://daytradingpost.test/auth/callback?next=/account",
      },
    });
    expect(result).toEqual({
      status: "success",
      message:
        "Revisa tu bandeja de entrada y confirma tu correo electrónico para activar la cuenta.",
    });
  });

  it("falls back to English for missing or unsupported locale values", async () => {
    await registerAction(initialAuthState, registrationForm("unsupported"));

    expect(mocks.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          data: expect.objectContaining({ language: "en" }),
        }),
      }),
    );
  });
});
