import {
  EMAIL_MAX_LENGTH,
  isValidEmailAddress,
  normalizeEmailAddress,
} from "./email";

export type AuthActionState = {
  fieldErrors?: Partial<
    Record<"fullName" | "email" | "password" | "confirmPassword", string>
  >;
  message: string;
  status: "idle" | "success" | "error";
};

export const initialAuthState: AuthActionState = {
  message: "",
  status: "idle",
};

export function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? normalizeEmailAddress(value) : "";
}

export function normalizeName(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function readPassword(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export function validateEmail(email: string) {
  if (!email) return "Enter your email address.";
  if (email.length > EMAIL_MAX_LENGTH || !isValidEmailAddress(email)) {
    return "Enter a valid email address.";
  }
}

export function validatePassword(password: string) {
  if (!password) return "Enter your password.";
  if (password.length < 8) return "Use at least 8 characters.";
  if (password.length > 128) return "Use no more than 128 characters.";
}
