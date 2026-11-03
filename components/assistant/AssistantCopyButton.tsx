"use client";

import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";

import { useState } from "react";

export function AssistantCopyButton({
  locale = "en",
  text,
}: {
  locale?: Locale;
  text: string;
}) {
  const tr = academyLessonText(locale);
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={tr("Copy assistant answer")}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        });
      }}
    >
      {copied ? tr("Copied") : tr("Copy")}
    </button>
  );
}
