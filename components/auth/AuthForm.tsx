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
import { initialAuthState, type AuthActionState } from "@/lib/validation/auth";
import { localizeHref, type Locale } from "@/lib/i18n/config";

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
    description: "Use a strong password you do not reuse on another website.",
    submit: "Update password",
  },
} as const;

const spanishModeContent = {
  login: {
    kicker: "Acceso de miembros",
    title: "Te damos la bienvenida.",
    description: "Inicia sesión para gestionar tu cuenta y tu acceso Premium.",
    submit: "Iniciar sesión",
  },
  register: {
    kicker: "Crea tu cuenta",
    title: "Únete a DayTradingPost.",
    description:
      "Crea una cuenta segura para informes de mercado, recursos educativos y acceso Premium.",
    submit: "Crear cuenta",
  },
  forgot: {
    kicker: "Recuperación de cuenta",
    title: "Restablece tu contraseña.",
    description:
      "Introduce el correo de tu cuenta y te enviaremos un enlace seguro.",
    submit: "Enviar enlace",
  },
  reset: {
    kicker: "Protege tu cuenta",
    title: "Elige una nueva contraseña.",
    description: "Utiliza una contraseña segura que no uses en otro sitio web.",
    submit: "Actualizar contraseña",
  },
} as const;

const actions = {
  login: loginAction,
  register: registerAction,
  forgot: forgotPasswordAction,
  reset: resetPasswordAction,
};

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button className="button button-full" type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export function AuthForm({
  mode,
  nextPath,
  initialMessage,
  locale = "en",
}: {
  mode: AuthMode;
  nextPath?: string;
  initialMessage?: string;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  const content = (spanish ? spanishModeContent : modeContent)[mode];
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
  const showPassword =
    mode === "login" || mode === "register" || mode === "reset";

  return (
    <section className="auth-card" aria-labelledby={`${mode}-title`}>
      <span className="section-kicker">{content.kicker}</span>
      <h1 id={`${mode}-title`}>{content.title}</h1>
      <p className="auth-description">{content.description}</p>

      <form action={formAction} className="auth-form" noValidate>
        <input type="hidden" name="locale" value={locale} />
        {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

        {mode === "register" ? (
          <div className="auth-field">
            <label htmlFor="fullName">
              {spanish ? "Nombre completo" : "Full name"}
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              maxLength={100}
              required
              aria-invalid={Boolean(state.fieldErrors?.fullName)}
              aria-describedby={
                state.fieldErrors?.fullName ? "fullName-error" : undefined
              }
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
            <label htmlFor={`${mode}-email`}>
              {spanish ? "Correo electrónico" : "Email address"}
            </label>
            <input
              id={`${mode}-email`}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              required
              aria-invalid={Boolean(state.fieldErrors?.email)}
              aria-describedby={
                state.fieldErrors?.email ? `${mode}-email-error` : undefined
              }
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
                {mode === "reset"
                  ? spanish
                    ? "Nueva contraseña"
                    : "New password"
                  : spanish
                    ? "Contraseña"
                    : "Password"}
              </label>
              {mode === "login" ? (
                <Link href={localizeHref("/forgot-password", locale)}>
                  {spanish ? "¿Olvidaste la contraseña?" : "Forgot password?"}
                </Link>
              ) : null}
            </div>
            <input
              id={`${mode}-password`}
              name="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              minLength={8}
              maxLength={128}
              required
              aria-invalid={Boolean(state.fieldErrors?.password)}
              aria-describedby={
                state.fieldErrors?.password
                  ? `${mode}-password-error`
                  : undefined
              }
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
            <label htmlFor={`${mode}-confirmPassword`}>
              {spanish ? "Confirmar contraseña" : "Confirm password"}
            </label>
            <input
              id={`${mode}-confirmPassword`}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
              aria-describedby={
                state.fieldErrors?.confirmPassword
                  ? `${mode}-confirm-error`
                  : undefined
              }
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
              <Link href="/account">
                {spanish ? "Continuar a la cuenta →" : "Continue to account →"}
              </Link>
            ) : null}
          </div>
        ) : null}

        <SubmitButton
          label={content.submit}
          pendingLabel={spanish ? "Espera un momento…" : "Please wait…"}
        />
      </form>

      <div className="auth-card-footer">
        {mode === "login" ? (
          <p>
            {spanish ? "¿Nuevo en DayTradingPost? " : "New to DayTradingPost? "}
            <Link href={localizeHref("/register", locale)}>
              {spanish ? "Crear una cuenta" : "Create an account"}
            </Link>
          </p>
        ) : null}
        {mode === "register" ? (
          <p>
            {spanish ? "¿Ya tienes una cuenta? " : "Already have an account? "}
            <Link href={localizeHref("/login", locale)}>
              {spanish ? "Iniciar sesión" : "Sign in"}
            </Link>
          </p>
        ) : null}
        {mode === "forgot" || mode === "reset" ? (
          <p>
            <Link href={localizeHref("/login", locale)}>
              {spanish ? "← Volver al inicio de sesión" : "← Return to sign in"}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
