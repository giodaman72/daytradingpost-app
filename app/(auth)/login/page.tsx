import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPage } from "@/components/auth/AuthPage";
import { getSafeNextPath } from "@/lib/auth/redirects";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your DayTradingPost member account.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const nextPath = getSafeNextPath(next);

  return (
    <AuthPage>
      <AuthForm mode="login" nextPath={nextPath} initialMessage={error} />
    </AuthPage>
  );
}
