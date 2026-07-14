import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  const tokenHash = redirectUrl.searchParams.get("token_hash");
  const type = redirectUrl.searchParams.get("type") as EmailOtpType | null;
  redirectUrl.search = "";

  if (tokenHash && type && isSupabaseAuthConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      redirectUrl.pathname = "/account";
      return NextResponse.redirect(redirectUrl);
    }
  }

  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set("error", "The confirmation link is invalid or expired.");
  return NextResponse.redirect(redirectUrl);
}
