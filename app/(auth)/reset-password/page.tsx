import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPage } from "@/components/auth/AuthPage";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "es" ? "Restablecer contraseña" : "Reset password",
    description:
      locale === "es"
        ? "Elige una nueva contraseña para tu cuenta de DayTradingPost."
        : "Choose a new password for your DayTradingPost account.",
    robots: { index: false, follow: false },
  };
}

export default async function ResetPasswordPage() {
  const locale = await getRequestLocale();
  return (
    <AuthPage locale={locale}>
      <AuthForm mode="reset" locale={locale} />
    </AuthPage>
  );
}
