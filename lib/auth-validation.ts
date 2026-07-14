export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<"fullName" | "email" | "password" | "confirmPassword", string>>;
};

export const initialAuthState: AuthActionState = {
  status: "idle",
  message: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function normalizeName(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function readPassword(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export function validateEmail(email: string) {
  if (!email) return "Enter your email address.";
  if (email.length > 254 || !emailPattern.test(email)) {
    return "Enter a valid email address.";
  }
}

export function validatePassword(password: string) {
  if (!password) return "Enter your password.";
  if (password.length < 8) return "Use at least 8 characters.";
  if (password.length > 128) return "Use no more than 128 characters.";
}
