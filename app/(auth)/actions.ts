"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  normalizeEmail,
  normalizeName,
  readPassword,
  validateEmail,
  validatePassword,
  type AuthActionState,
} from "@/lib/auth-validation";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function configurationError(): AuthActionState {
  return {
    status: "error",
    message:
      "Member access is not configured yet. Add the Supabase publishable key and restart the server.",
  };
}

function getSafeNextPath(value: FormDataEntryValue | null) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/account";
  }

  return value;
}

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (origin) return origin;

  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = normalizeEmail(formData.get("email"));
  const password = readPassword(formData.get("password"));
  const fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (fieldErrors.email || fieldErrors.password) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  if (!isSupabaseAuthConfigured()) return configurationError();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      status: "error",
      message: "The email or password is incorrect.",
    };
  }

  redirect(getSafeNextPath(formData.get("next")));
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fullName = normalizeName(formData.get("fullName"));
  const email = normalizeEmail(formData.get("email"));
  const password = readPassword(formData.get("password"));
  const confirmPassword = readPassword(formData.get("confirmPassword"));
  const fieldErrors = {
    fullName:
      !fullName || fullName.length > 100
        ? "Enter your full name using no more than 100 characters."
        : undefined,
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword:
      password !== confirmPassword ? "The passwords do not match." : undefined,
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  if (!isSupabaseAuthConfigured()) return configurationError();

  const supabase = await createClient();
  const origin = await getRequestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message === "User already registered"
          ? "An account already exists for this email."
          : "We could not create your account. Please try again.",
    };
  }

  if (data.session) {
    redirect("/account");
  }

  return {
    status: "success",
    message:
      "Check your inbox and confirm your email address to activate your account.",
  };
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = normalizeEmail(formData.get("email"));
  const emailError = validateEmail(email);

  if (emailError) {
    return {
      status: "error",
      message: "Enter a valid email address.",
      fieldErrors: { email: emailError },
    };
  }

  if (!isSupabaseAuthConfigured()) return configurationError();

  const supabase = await createClient();
  const origin = await getRequestOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error?.message.toLowerCase().includes("rate")) {
    return {
      status: "error",
      message: "Please wait before requesting another reset email.",
    };
  }

  return {
    status: "success",
    message:
      "If an account exists for that email, a secure password-reset link is on its way.",
  };
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = readPassword(formData.get("password"));
  const confirmPassword = readPassword(formData.get("confirmPassword"));
  const fieldErrors = {
    password: validatePassword(password),
    confirmPassword:
      password !== confirmPassword ? "The passwords do not match." : undefined,
  };

  if (fieldErrors.password || fieldErrors.confirmPassword) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  if (!isSupabaseAuthConfigured()) return configurationError();

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      status: "error",
      message:
        "This reset session has expired. Request a new password-reset email.",
    };
  }

  return {
    status: "success",
    message: "Your password has been updated. You can continue to your account.",
  };
}

export async function logoutAction() {
  if (isSupabaseAuthConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
