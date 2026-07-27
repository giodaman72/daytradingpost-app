"use server";

import { redirect } from "next/navigation";
import {
  getEmailOtpFailurePath,
  getEmailOtpSuccessPath,
  parseSupportedEmailOtpType,
} from "@/lib/auth/emailOtp";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function verifyEmailOtpAction(formData: FormData) {
  const tokenHash = formData.get("token_hash");
  const type = parseSupportedEmailOtpType(formData.get("type"));

  if (
    typeof tokenHash !== "string" ||
    tokenHash.length === 0 ||
    !type ||
    !isSupabaseAuthConfigured()
  ) {
    redirect(getEmailOtpFailurePath(type));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    redirect(getEmailOtpFailurePath(type));
  }

  redirect(getEmailOtpSuccessPath(type));
}
