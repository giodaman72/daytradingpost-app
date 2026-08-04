import type { Metadata } from "next";
import Link from "next/link";
import { verifyEmailOtpAction } from "./actions";
import { AuthPage } from "@/components/auth/AuthPage";
import { parseSupportedEmailOtpType } from "@/lib/auth/emailOtp";
import { localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title:
      locale === "es" ? "Verificar enlace seguro" : "Verify secure email link",
    description:
      locale === "es"
        ? "Completa una verificación segura de correo de DayTradingPost."
        : "Complete a DayTradingPost email verification request.",
    robots: { index: false, follow: false },
  };
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const [{ token_hash: tokenHash, type: rawType }, locale] = await Promise.all([
    searchParams,
    getRequestLocale(),
  ]);
  const spanish = locale === "es";
  const type = parseSupportedEmailOtpType(rawType);
  const verificationRequest =
    tokenHash && type ? { tokenHash, type } : undefined;
  const validRequest = Boolean(verificationRequest);
  const recovery = type === "recovery";

  return (
    <AuthPage locale={locale}>
      <section className="auth-card" aria-labelledby="verify-email-title">
        <span className="section-kicker">
          {spanish
            ? "Verificación segura de correo"
            : "Secure email verification"}
        </span>
        <h1 id="verify-email-title">
          {recovery
            ? spanish
              ? "Continúa con el restablecimiento de tu contraseña."
              : "Continue your password reset."
            : spanish
              ? "Confirma tu cuenta."
              : "Confirm your account."}
        </h1>
        <p className="auth-description">
          {validRequest
            ? spanish
              ? "Por tu seguridad, la solicitud se completa únicamente cuando pulsas el botón inferior."
              : "For your security, this request is completed only after you press the button below."
            : spanish
              ? "Este enlace seguro está incompleto o es inválido. Solicita otro correo e inténtalo de nuevo."
              : "This secure email link is incomplete or invalid. Request a new email and try again."}
        </p>

        {verificationRequest ? (
          <form action={verifyEmailOtpAction} className="auth-form">
            <input
              type="hidden"
              name="token_hash"
              value={verificationRequest.tokenHash}
            />
            <input type="hidden" name="type" value={verificationRequest.type} />
            <input type="hidden" name="locale" value={locale} />
            <button className="button button-full" type="submit">
              {recovery
                ? spanish
                  ? "Continuar para restablecer la contraseña"
                  : "Continue to reset password"
                : spanish
                  ? "Confirmar correo electrónico"
                  : "Confirm email address"}
            </button>
          </form>
        ) : (
          <div className="auth-status auth-status-error" role="alert">
            {spanish
              ? "Solicita un correo nuevo antes de continuar."
              : "Request a fresh email before continuing."}
          </div>
        )}

        <div className="auth-card-footer">
          <p>
            <Link
              href={localizeHref(
                recovery ? "/forgot-password" : "/login",
                locale,
              )}
            >
              {recovery
                ? spanish
                  ? "Solicitar otro correo de restablecimiento"
                  : "Request another reset email"
                : spanish
                  ? "Volver al inicio de sesión"
                  : "Return to sign in"}
            </Link>
          </p>
        </div>
      </section>
    </AuthPage>
  );
}
