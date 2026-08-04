import { beforeEach, describe, expect, it, vi } from "vitest";
import { initialAuthState } from "@/lib/validation/auth";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  signInWithPassword: vi.fn(),
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
  createClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
    },
  })),
}));

import { loginAction, registerAction } from "./actions";

function registrationForm(locale?: string) {
  const formData = new FormData();
  formData.set("fullName", "María Trader");
  formData.set("email", "maria@example.com");
  formData.set("password", "secure-password");
  formData.set("confirmPassword", "secure-password");
  if (locale) formData.set("locale", locale);
  return formData;
}

function loginForm(locale?: string, next?: string) {
  const formData = new FormData();
  formData.set("email", "maria@example.com");
  formData.set("password", "secure-password");
  if (locale) formData.set("locale", locale);
  if (next) formData.set("next", next);
  return formData;
}

describe("registration confirmation locale", () => {
  beforeEach(() => {
    mocks.redirect.mockReset();
    mocks.signInWithPassword.mockReset();
    mocks.signUp.mockReset();
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { user_metadata: { language: "en" } } },
      error: null,
    });
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
          "https://daytradingpost.test/auth/callback?next=%2Fes%2Faccount",
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

  it("keeps Spanish-created users in Spanish member routes after login", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { user_metadata: { language: "es" } } },
      error: null,
    });

    await loginAction(initialAuthState, loginForm("en", "/dashboard"));

    expect(mocks.redirect).toHaveBeenCalledWith("/es/dashboard");
  });

  it("honors the Spanish login route for any member", async () => {
    await loginAction(initialAuthState, loginForm("es", "/account/billing"));

    expect(mocks.redirect).toHaveBeenCalledWith("/es/account/billing");
  });
});
