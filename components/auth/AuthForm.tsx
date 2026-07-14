"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction,
} from "@/app/(auth)/actions";
import {
  initialAuthState,
  type AuthActionState,
} from "@/lib/auth-validation";

type AuthMode = "login" | "register" | "forgot" | "reset";

const modeContent = {
  login: {
    kicker: "Member access",
    title: "Welcome back.",
    description:
      "Sign in to manage your DayTradingPost account and premium access.",
    submit: "Sign in",
  },
  register: {
    kicker: "Create your account",
    title: "Join DayTradingPost.",
    description:
      "Create one secure account for market briefings, learning resources and future premium access.",
    submit: "Create account",
  },
  forgot: {
    kicker: "Account recovery",
    title: "Reset your password.",
    description:
      "Enter your account email and we will send a secure reset link.",
    submit: "Send reset link",
  },
  reset: {
    kicker: "Secure your account",
    title: "Choose a new password.",
    description:
      "Use a strong password you do not reuse on another website.",
    submit: "Update password",
  },
} as const;

const actions = {
  login: loginAction,
  register: registerAction,
  forgot: forgotPasswordAction,
  reset: resetPasswordAction,
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="button button-full" type="submit" disabled={pending}>
      {pending ? "Please wait…" : label}
    </button>
  );
}

export function AuthForm({
  mode,
  nextPath,
  initialMessage,
}: {
  mode: AuthMode;
  nextPath?: string;
  initialMessage?: string;
}) {
  const content = modeContent[mode];
  const action: (
    previousState: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState> = actions[mode];
  const formInitialState: AuthActionState = {
    ...initialAuthState,
    status: initialMessage ? "error" : "idle",
    message: initialMessage ?? "",
  };
  const [state, formAction] = useActionState(action, formInitialState);
  const showEmail = mode !== "reset";
  const showPassword = mode === "login" || mode === "register" || mode === "reset";

  return (
    <section className="auth-card" aria-labelledby={`${mode}-title`}>
      <span className="section-kicker">{content.kicker}</span>
      <h1 id={`${mode}-title`}>{content.title}</h1>
      <p className="auth-description">{content.description}</p>

      <form action={formAction} className="auth-form" noValidate>
        {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

        {mode === "register" ? (
          <div className="auth-field">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              maxLength={100}
              required
              aria-invalid={Boolean(state.fieldErrors?.fullName)}
              aria-describedby={state.fieldErrors?.fullName ? "fullName-error" : undefined}
            />
            {state.fieldErrors?.fullName ? (
              <span id="fullName-error" className="auth-field-error">
                {state.fieldErrors.fullName}
              </span>
            ) : null}
          </div>
        ) : null}

        {showEmail ? (
          <div className="auth-field">
            <label htmlFor={`${mode}-email`}>Email address</label>
            <input
              id={`${mode}-email`}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              required
              aria-invalid={Boolean(state.fieldErrors?.email)}
              aria-describedby={state.fieldErrors?.email ? `${mode}-email-error` : undefined}
            />
            {state.fieldErrors?.email ? (
              <span id={`${mode}-email-error`} className="auth-field-error">
                {state.fieldErrors.email}
              </span>
            ) : null}
          </div>
        ) : null}

        {showPassword ? (
          <div className="auth-field">
            <div className="auth-label-row">
              <label htmlFor={`${mode}-password`}>
                {mode === "reset" ? "New password" : "Password"}
              </label>
              {mode === "login" ? <Link href="/forgot-password">Forgot password?</Link> : null}
            </div>
            <input
              id={`${mode}-password`}
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={8}
              maxLength={128}
              required
              aria-invalid={Boolean(state.fieldErrors?.password)}
              aria-describedby={state.fieldErrors?.password ? `${mode}-password-error` : undefined}
            />
            {state.fieldErrors?.password ? (
              <span id={`${mode}-password-error`} className="auth-field-error">
                {state.fieldErrors.password}
              </span>
            ) : null}
          </div>
        ) : null}

        {mode === "register" || mode === "reset" ? (
          <div className="auth-field">
            <label htmlFor={`${mode}-confirmPassword`}>Confirm password</label>
            <input
              id={`${mode}-confirmPassword`}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
              aria-describedby={state.fieldErrors?.confirmPassword ? `${mode}-confirm-error` : undefined}
            />
            {state.fieldErrors?.confirmPassword ? (
              <span id={`${mode}-confirm-error`} className="auth-field-error">
                {state.fieldErrors.confirmPassword}
              </span>
            ) : null}
          </div>
        ) : null}

        {state.message ? (
          <div
            className={`auth-status auth-status-${state.status}`}
            role={state.status === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {state.message}
            {mode === "reset" && state.status === "success" ? (
              <Link href="/account">Continue to account →</Link>
            ) : null}
          </div>
        ) : null}

        <SubmitButton label={content.submit} />
      </form>

      <div className="auth-card-footer">
        {mode === "login" ? (
          <p>New to DayTradingPost? <Link href="/register">Create an account</Link></p>
        ) : null}
        {mode === "register" ? (
          <p>Already have an account? <Link href="/login">Sign in</Link></p>
        ) : null}
        {mode === "forgot" || mode === "reset" ? (
          <p><Link href="/login">← Return to sign in</Link></p>
        ) : null}
      </div>
    </section>
  );
}
