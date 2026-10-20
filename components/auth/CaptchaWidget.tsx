"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
import { CAPTCHA_RESPONSE_FIELD } from "@/lib/auth/captcha";

type TurnstileRenderOptions = {
  sitekey: string;
  action?: string;
  language?: string;
  theme?: "auto" | "light" | "dark";
  size?: "normal" | "flexible" | "compact";
  "response-field-name"?: string;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Renders a Cloudflare Turnstile challenge inside the surrounding <form>.
 * Turnstile writes its token into a hidden input named
 * `cf-turnstile-response`, which the server action forwards to Supabase.
 *
 * `resetSignal` should change after every submission: a token can only be
 * verified once, so the widget must issue a fresh one before the next try.
 */
export function CaptchaWidget({
  siteKey,
  action,
  locale,
  resetSignal,
}: {
  siteKey: string;
  action: string;
  locale: string;
  resetSignal: unknown;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const firstSignalRef = useRef(true);

  const renderWidget = useCallback(() => {
    const container = containerRef.current;
    if (!container || !window.turnstile || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(container, {
      sitekey: siteKey,
      action,
      language: locale,
      theme: "auto",
      size: "flexible",
      "response-field-name": CAPTCHA_RESPONSE_FIELD,
    });
  }, [siteKey, action, locale]);

  useEffect(() => {
    // Covers client-side navigation back to a form when the script is cached.
    renderWidget();
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [renderWidget]);

  useEffect(() => {
    if (firstSignalRef.current) {
      firstSignalRef.current = false;
      return;
    }
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetSignal]);

  return (
    <>
      <Script
        src={TURNSTILE_SCRIPT}
        strategy="afterInteractive"
        onReady={renderWidget}
      />
      <div ref={containerRef} className="auth-captcha" />
    </>
  );
}
