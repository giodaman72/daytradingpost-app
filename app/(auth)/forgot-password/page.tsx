import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a secure DayTradingPost password reset link.",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthPage>
      <AuthForm mode="forgot" initialMessage={error} />
    </AuthPage>
  );
}
