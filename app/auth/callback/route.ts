import { NextResponse, type NextRequest } from "next/server";
import { getSafeNextPath } from "@/lib/auth/redirects";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  const code = redirectUrl.searchParams.get("code");
  const next = getSafeNextPath(redirectUrl.searchParams.get("next"));
  redirectUrl.search = "";

  if (code && isSupabaseAuthConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirectUrl.pathname = next;
      return NextResponse.redirect(redirectUrl);
    }
  }

  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set("error", "The authentication link is invalid or expired.");
  return NextResponse.redirect(redirectUrl);
}
