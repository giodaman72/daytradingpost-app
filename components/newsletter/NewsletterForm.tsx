"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  getNewsletterEmailError,
  NEWSLETTER_EMAIL_MAX_LENGTH,
  normalizeNewsletterEmail,
} from "@/lib/validation/newsletter";
import { localizeHref, type Locale } from "@/lib/i18n/config";

type FormStatus =
  | { type: "idle"; message: "" }
  | { type: "loading"; message: string }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

type NewsletterApiResponse = {
  message?: string;
  ok?: boolean;
};

const INITIAL_STATUS: FormStatus = { type: "idle", message: "" };

export function NewsletterForm({ locale = "en" }: { locale?: Locale }) {
  const spanish = locale === "es";
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<FormStatus>(INITIAL_STATUS);

  function clearError() {
    if (status.type === "error") {
      setStatus(INITIAL_STATUS);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const normalizedEmail = normalizeNewsletterEmail(email);
    const emailError = getNewsletterEmailError(normalizedEmail);

    if (emailError) {
      setStatus({
        type: "error",
        message: spanish
          ? "Introduce una dirección de correo electrónico válida."
          : emailError,
      });
      const emailInput = form.elements.namedItem("email");

      if (emailInput instanceof HTMLElement) {
        emailInput.focus();
      }

      return;
    }

    if (!consent) {
      setStatus({
        type: "error",
        message: spanish
          ? "Confirma que aceptas recibir el boletín."
          : "Confirm that you agree to receive the newsletter.",
      });
      return;
    }

    setStatus({
      type: "loading",
      message: spanish ? "Enviando tu suscripción…" : "Submitting your signup…",
    });

    const formData = new FormData(form);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          consent,
          company: formData.get("company") ?? "",
        }),
      });
      const result = (await response.json()) as NewsletterApiResponse;

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message ??
            (spanish
              ? "No pudimos completar la suscripción. Inténtalo de nuevo."
              : "We couldn’t complete your signup. Please try again."),
        );
      }

      setEmail("");
      setConsent(false);
      setStatus({
        type: "success",
        message: spanish
          ? "Ya estás suscrito. Revisa tu correo para recibir el informe diario de mercados."
          : (result.message ??
            "You’re subscribed. Watch your inbox for the Daily Market Brief."),
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : spanish
              ? "No pudimos completar la suscripción. Inténtalo de nuevo."
              : "We couldn’t complete your signup. Please try again.",
      });
    }
  }

  if (status.type === "success") {
    return (
      <div className="newsletter-confirmation" role="status" aria-live="polite">
        <span className="newsletter-confirmation-icon" aria-hidden="true">
          ✓
        </span>
        <div>
          <strong>
            {spanish ? "Suscripción confirmada" : "Signup confirmed"}
          </strong>
          <p>{status.message}</p>
        </div>
      </div>
    );
  }

  const isLoading = status.type === "loading";
  const statusId = status.message ? "newsletter-status" : undefined;

  return (
    <form
      className="newsletter-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isLoading}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        {spanish ? "Correo electrónico" : "Email address"}
      </label>

      <input
        id="newsletter-email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={
          spanish
            ? "Introduce tu correo electrónico"
            : "Enter your email address"
        }
        value={email}
        maxLength={NEWSLETTER_EMAIL_MAX_LENGTH}
        onChange={(event) => {
          setEmail(event.target.value);
          clearError();
        }}
        aria-invalid={status.type === "error"}
        aria-describedby={statusId}
        disabled={isLoading}
        required
      />

      <button className="button" type="submit" disabled={isLoading}>
        {isLoading
          ? spanish
            ? "Suscribiendo…"
            : "Subscribing…"
          : spanish
            ? "Suscribirme"
            : "Subscribe"}
      </button>

      <div className="newsletter-consent">
        <input
          id="newsletter-consent"
          type="checkbox"
          name="consent"
          checked={consent}
          onChange={(event) => {
            setConsent(event.target.checked);
            clearError();
          }}
          disabled={isLoading}
          required
        />
        <label htmlFor="newsletter-consent">
          {spanish ? (
            <>
              Acepto recibir correos de DayTradingPost y la{" "}
              <Link href={localizeHref("/privacy", locale)}>
                política de privacidad
              </Link>
              . Puedo cancelar la suscripción en cualquier momento.
            </>
          ) : (
            <>
              I agree to receive DayTradingPost emails and accept the{" "}
              <Link href="/privacy">privacy policy</Link>. I can unsubscribe at
              any time.
            </>
          )}
        </label>
      </div>

      <div className="newsletter-honeypot" aria-hidden="true">
        <label htmlFor="newsletter-company">
          {spanish ? "Empresa" : "Company"}
        </label>
        <input
          id="newsletter-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {status.message ? (
        <p
          className={`newsletter-status newsletter-status-${status.type}`}
          id="newsletter-status"
          role={status.type === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
