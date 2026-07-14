"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  getNewsletterEmailError,
  NEWSLETTER_EMAIL_MAX_LENGTH,
  normalizeNewsletterEmail,
} from "@/lib/validation/newsletter";

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

export function NewsletterForm() {
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
      setStatus({ type: "error", message: emailError });
      const emailInput = form.elements.namedItem("email");

      if (emailInput instanceof HTMLElement) {
        emailInput.focus();
      }

      return;
    }

    if (!consent) {
      setStatus({
        type: "error",
        message: "Confirm that you agree to receive the newsletter.",
      });
      return;
    }

    setStatus({ type: "loading", message: "Submitting your signup…" });

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
          result.message ?? "We couldn’t complete your signup. Please try again.",
        );
      }

      setEmail("");
      setConsent(false);
      setStatus({
        type: "success",
        message:
          result.message ??
          "You’re subscribed. Watch your inbox for the Daily Market Brief.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
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
          <strong>Signup confirmed</strong>
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
        Email address
      </label>

      <input
        id="newsletter-email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="Enter your email address"
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
        {isLoading ? "Subscribing…" : "Subscribe"}
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
          I agree to receive DayTradingPost emails and accept the{" "}
          <Link href="/privacy">privacy policy</Link>. I can unsubscribe at any
          time.
        </label>
      </div>

      <div className="newsletter-honeypot" aria-hidden="true">
        <label htmlFor="newsletter-company">Company</label>
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
