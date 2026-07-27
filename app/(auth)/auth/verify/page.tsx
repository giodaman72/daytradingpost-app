import type { Metadata } from "next";
import Link from "next/link";
import { verifyEmailOtpAction } from "./actions";
import { AuthPage } from "@/components/auth/AuthPage";
import { parseSupportedEmailOtpType } from "@/lib/auth/emailOtp";

export const metadata: Metadata = {
  title: "Verify secure email link",
  description: "Complete a DayTradingPost email verification request.",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash: tokenHash, type: rawType } = await searchParams;
  const type = parseSupportedEmailOtpType(rawType);
  const verificationRequest =
    tokenHash && type ? { tokenHash, type } : undefined;
  const validRequest = Boolean(verificationRequest);
  const recovery = type === "recovery";

  return (
    <AuthPage>
      <section className="auth-card" aria-labelledby="verify-email-title">
        <span className="section-kicker">Secure email verification</span>
        <h1 id="verify-email-title">
          {recovery ? "Continue your password reset." : "Confirm your account."}
        </h1>
        <p className="auth-description">
          {validRequest
            ? "For your security, this request is completed only after you press the button below."
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
            <button className="button button-full" type="submit">
              {recovery
                ? "Continue to reset password"
                : "Confirm email address"}
            </button>
          </form>
        ) : (
          <div className="auth-status auth-status-error" role="alert">
            Request a fresh email before continuing.
          </div>
        )}

        <div className="auth-card-footer">
          <p>
            <Link href={recovery ? "/forgot-password" : "/login"}>
              {recovery ? "Request another reset email" : "Return to sign in"}
            </Link>
          </p>
        </div>
      </section>
    </AuthPage>
  );
}
