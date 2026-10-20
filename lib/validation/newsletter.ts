import {
  EMAIL_MAX_LENGTH,
  isValidEmailAddress,
  normalizeEmailAddress,
} from "./email";

export const NEWSLETTER_EMAIL_MAX_LENGTH = EMAIL_MAX_LENGTH;

export function normalizeNewsletterEmail(email: string) {
  return normalizeEmailAddress(email);
}

export function getNewsletterEmailError(email: string) {
  if (!email) return "Enter your email address.";

  if (email.length > NEWSLETTER_EMAIL_MAX_LENGTH) {
    return "Email addresses must be 254 characters or fewer.";
  }

  if (!isValidEmailAddress(email)) return "Enter a valid email address.";

  return null;
}

/** Where a signup came from, stored so the owner can see which pages convert. */
export const NEWSLETTER_SOURCES = ["homepage", "article"] as const;
export type NewsletterSource = (typeof NEWSLETTER_SOURCES)[number];

export function parseNewsletterSource(value: unknown): NewsletterSource {
  return NEWSLETTER_SOURCES.find((source) => source === value) ?? "homepage";
}
