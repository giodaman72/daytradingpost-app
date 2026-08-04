import type { EmailOtpType } from "@supabase/supabase-js";
import { DEFAULT_LOCALE, localizeHref, type Locale } from "@/lib/i18n/config";

export type SupportedEmailOtpType = Extract<EmailOtpType, "email" | "recovery">;

export function parseSupportedEmailOtpType(
  value: FormDataEntryValue | string | null | undefined,
): SupportedEmailOtpType | null {
  return value === "email" || value === "recovery" ? value : null;
}

export function getEmailOtpSuccessPath(
  type: SupportedEmailOtpType,
  locale: Locale = DEFAULT_LOCALE,
) {
  return type === "recovery"
    ? localizeHref("/reset-password", locale)
    : localizeHref("/account", locale);
}

export function getEmailOtpFailurePath(
  type: SupportedEmailOtpType | null,
  locale: Locale = DEFAULT_LOCALE,
) {
  const message = encodeURIComponent(
    locale === "es"
      ? "Este enlace seguro es inválido o ha caducado. Solicita uno nuevo e inténtalo de nuevo."
      : "This secure email link is invalid or expired. Request a new one and try again.",
  );

  const pathname = type === "recovery" ? "/forgot-password" : "/login";
  return `${localizeHref(pathname, locale)}?error=${message}`;
}
