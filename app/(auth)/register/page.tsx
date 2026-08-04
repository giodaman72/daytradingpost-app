import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPage } from "@/components/auth/AuthPage";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "es" ? "Crear cuenta" : "Create account",
    description:
      locale === "es"
        ? "Crea tu cuenta segura de miembro de DayTradingPost."
        : "Create your secure DayTradingPost member account.",
    robots: { index: false, follow: false },
  };
}

export default async function RegisterPage() {
  const locale = await getRequestLocale();
  return (
    <AuthPage locale={locale}>
      <AuthForm mode="register" locale={locale} />
    </AuthPage>
  );
}
