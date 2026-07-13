export const NEWSLETTER_EMAIL_MAX_LENGTH = 254;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeNewsletterEmail(email: string) {
  return email.normalize("NFKC").trim().toLowerCase();
}

export function getNewsletterEmailError(email: string) {
  if (!email) {
    return "Enter your email address.";
  }

  if (email.length > NEWSLETTER_EMAIL_MAX_LENGTH) {
    return "Email addresses must be 254 characters or fewer.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address.";
  }

  return null;
}
