import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your DayTradingPost account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthPage>
      <AuthForm mode="reset" />
    </AuthPage>
  );
}
