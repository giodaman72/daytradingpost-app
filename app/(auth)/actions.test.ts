import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialAuthState } from "@/lib/validation/auth";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
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
      resetPasswordForEmail: mocks.resetPasswordForEmail,
    },
  })),
}));

import { forgotPasswordAction, loginAction, registerAction } from "./actions";

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

describe("Turnstile CAPTCHA", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "test-site-key");
    mocks.redirect.mockReset();
    mocks.signInWithPassword.mockReset();
    mocks.signUp.mockReset();
    mocks.resetPasswordForEmail.mockReset();
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { user_metadata: { language: "en" } } },
      error: null,
    });
    mocks.signUp.mockResolvedValue({ data: { session: null }, error: null });
    mocks.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function withToken(formData: FormData, token = "turnstile-token") {
    formData.set("cf-turnstile-response", token);
    return formData;
  }

  it("rejects sign-up without a token before contacting Supabase", async () => {
    const result = await registerAction(initialAuthState, registrationForm());

    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "error",
      message: "Complete the security check and try again.",
    });
  });

  it("forwards the token to Supabase on sign-up", async () => {
    await registerAction(initialAuthState, withToken(registrationForm()));

    expect(mocks.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ captchaToken: "turnstile-token" }),
      }),
    );
  });

  it("forwards the token to Supabase on sign-in", async () => {
    await loginAction(initialAuthState, withToken(loginForm()));

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "maria@example.com",
      password: "secure-password",
      options: { captchaToken: "turnstile-token" },
    });
  });

  it("rejects sign-in without a token in the form's language", async () => {
    const result = await loginAction(initialAuthState, loginForm("es"));

    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "error",
      message: "Completa la verificación de seguridad e inténtalo de nuevo.",
    });
  });

  it("explains a token Supabase refuses instead of a wrong password", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "captcha protection: request disallowed" },
    });

    const result = await loginAction(initialAuthState, withToken(loginForm()));

    expect(result).toEqual({
      status: "error",
      message: "Complete the security check and try again.",
    });
  });

  it("forwards the token on password-reset requests", async () => {
    const formData = new FormData();
    formData.set("email", "maria@example.com");

    const missing = await forgotPasswordAction(initialAuthState, formData);
    expect(missing.status).toBe("error");
    expect(mocks.resetPasswordForEmail).not.toHaveBeenCalled();

    const result = await forgotPasswordAction(
      initialAuthState,
      withToken(formData),
    );
    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith(
      "maria@example.com",
      expect.objectContaining({ captchaToken: "turnstile-token" }),
    );
    expect(result.status).toBe("success");
  });
});
