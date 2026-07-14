export const EMAIL_MAX_LENGTH = 254;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmailAddress(value: string) {
  return value.normalize("NFKC").trim().toLowerCase();
}

export function isValidEmailAddress(value: string) {
  return value.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(value);
}
