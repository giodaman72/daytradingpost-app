import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPage } from "@/components/auth/AuthPage";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "es" ? "Contraseña olvidada" : "Forgot password",
    description:
      locale === "es"
        ? "Solicita un enlace seguro para restablecer tu contraseña de DayTradingPost."
        : "Request a secure DayTradingPost password reset link.",
    robots: { index: false, follow: false },
  };
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, locale] = await Promise.all([
    searchParams,
    getRequestLocale(),
  ]);

  return (
    <AuthPage locale={locale}>
      <AuthForm mode="forgot" initialMessage={error} locale={locale} />
    </AuthPage>
  );
}
