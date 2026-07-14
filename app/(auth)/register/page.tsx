import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your secure DayTradingPost member account.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <AuthPage>
      <AuthForm mode="register" />
    </AuthPage>
  );
}
