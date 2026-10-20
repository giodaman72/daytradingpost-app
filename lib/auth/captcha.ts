/**
 * Cloudflare Turnstile CAPTCHA helpers shared by the auth forms and actions.
 *
 * The site key is public and inlined at build time. The matching secret key is
 * never used here: it lives only in Supabase (Authentication → Attack
 * Protection), which verifies the token on signUp, signInWithPassword and
 * resetPasswordForEmail.
 */

/** Hidden form field the Turnstile widget writes its token into. */
export const CAPTCHA_RESPONSE_FIELD = "cf-turnstile-response";

export function getCaptchaSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || undefined;
}

export function isCaptchaConfigured(): boolean {
  return Boolean(getCaptchaSiteKey());
}

export function readCaptchaToken(formData: FormData): string | undefined {
  const value = formData.get(CAPTCHA_RESPONSE_FIELD);
  if (typeof value !== "string") return undefined;
  const token = value.trim();
  return token.length > 0 && token.length <= 4096 ? token : undefined;
}

/** Supabase reports a failed or missing CAPTCHA with a message naming it. */
export function isCaptchaError(error: { message?: string } | null): boolean {
  return Boolean(error?.message?.toLowerCase().includes("captcha"));
}

export function captchaErrorMessage(spanish: boolean): string {
  return spanish
    ? "Completa la verificación de seguridad e inténtalo de nuevo."
    : "Complete the security check and try again.";
}
