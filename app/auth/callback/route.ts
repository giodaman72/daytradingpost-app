import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export async function GET(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  const code = redirectUrl.searchParams.get("code");
  const next = safeNextPath(redirectUrl.searchParams.get("next"));
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
