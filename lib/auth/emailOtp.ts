import type { EmailOtpType } from "@supabase/supabase-js";

export type SupportedEmailOtpType = Extract<EmailOtpType, "email" | "recovery">;

export function parseSupportedEmailOtpType(
  value: FormDataEntryValue | string | null | undefined,
): SupportedEmailOtpType | null {
  return value === "email" || value === "recovery" ? value : null;
}

export function getEmailOtpSuccessPath(type: SupportedEmailOtpType) {
  return type === "recovery" ? "/reset-password" : "/account";
}

export function getEmailOtpFailurePath(type: SupportedEmailOtpType | null) {
  const message = encodeURIComponent(
    "This secure email link is invalid or expired. Request a new one and try again.",
  );

  return type === "recovery"
    ? `/forgot-password?error=${message}`
    : `/login?error=${message}`;
}
