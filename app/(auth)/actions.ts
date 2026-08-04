"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSafeNextPath } from "@/lib/auth/redirects";
import {
  DEFAULT_LOCALE,
  isLocale,
  localizeHref,
  type Locale,
} from "@/lib/i18n/config";
import {
  normalizeEmail,
  normalizeName,
  readPassword,
  validateEmail,
  validatePassword,
  type AuthActionState,
} from "@/lib/validation/auth";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function configurationError(): AuthActionState {
  return {
    status: "error",
    message:
      "Member access is not configured yet. Add the Supabase publishable key and restart the server.",
  };
}

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (origin) return origin;

  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

function getFormLocale(formData: FormData): Locale {
  const locale = formData.get("locale");
  return typeof locale === "string" && isLocale(locale)
    ? locale
    : DEFAULT_LOCALE;
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const locale = getFormLocale(formData);
  const spanish = locale === "es";
  const email = normalizeEmail(formData.get("email"));
  const password = readPassword(formData.get("password"));
  const fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (fieldErrors.email || fieldErrors.password) {
    return {
      status: "error",
      message: spanish
        ? "Revisa los campos resaltados e inténtalo de nuevo."
        : "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  if (!isSupabaseAuthConfigured()) return configurationError();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      status: "error",
      message: spanish
        ? "El correo electrónico o la contraseña son incorrectos."
        : "The email or password is incorrect.",
    };
  }

  const storedLanguage = data.user?.user_metadata.language;
  const destinationLocale: Locale =
    locale === "es" || storedLanguage === "es" ? "es" : DEFAULT_LOCALE;
  redirect(
    localizeHref(getSafeNextPath(formData.get("next")), destinationLocale),
  );
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const locale = getFormLocale(formData);
  const spanish = locale === "es";
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
      message: spanish
        ? "Revisa los campos resaltados e inténtalo de nuevo."
        : "Check the highlighted fields and try again.",
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
      data: { full_name: fullName, language: locale },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
        localizeHref("/account", locale),
      )}`,
    },
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message === "User already registered"
          ? spanish
            ? "Ya existe una cuenta con este correo electrónico."
            : "An account already exists for this email."
          : spanish
            ? "No pudimos crear tu cuenta. Inténtalo de nuevo."
            : "We could not create your account. Please try again.",
    };
  }

  if (data.session) {
    redirect(localizeHref("/account", locale));
  }

  return {
    status: "success",
    message: spanish
      ? "Revisa tu bandeja de entrada y confirma tu correo electrónico para activar la cuenta."
      : "Check your inbox and confirm your email address to activate your account.",
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
    message:
      "Your password has been updated. You can continue to your account.",
  };
}

export async function logoutAction(formData?: FormData) {
  const locale = formData ? getFormLocale(formData) : DEFAULT_LOCALE;
  if (isSupabaseAuthConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect(localizeHref("/login", locale));
}
