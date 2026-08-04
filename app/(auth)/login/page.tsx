import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPage } from "@/components/auth/AuthPage";
import { getSafeNextPath } from "@/lib/auth/redirects";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "es" ? "Iniciar sesión" : "Sign in",
    description:
      locale === "es"
        ? "Inicia sesión en tu cuenta de miembro de DayTradingPost."
        : "Sign in to your DayTradingPost member account.",
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const [{ next, error }, locale] = await Promise.all([
    searchParams,
    getRequestLocale(),
  ]);
  const nextPath = getSafeNextPath(next);

  return (
    <AuthPage locale={locale}>
      <AuthForm
        mode="login"
        nextPath={nextPath}
        initialMessage={error}
        locale={locale}
      />
    </AuthPage>
  );
}
