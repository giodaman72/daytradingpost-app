import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/constants/routes";
import { getSafeNextPath } from "@/lib/auth/redirects";
import { isSupabaseAuthConfigured, getSupabaseAuthConfig } from "./config";

const protectedPrefixes = [
  ROUTES.account,
  ROUTES.dashboard,
  ROUTES.watchlists,
  ROUTES.alerts,
  "/members",
  ROUTES.membership.success,
  ROUTES.membership.pending,
];
const guestOnlyRoutes: readonly string[] = [
  ROUTES.auth.login,
  ROUTES.auth.register,
];

export async function updateSession(request: NextRequest) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseAuthConfig();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);
  const { pathname } = request.nextUrl;
  const isProtected =
    protectedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) || pathname === "/reset-password";

  if (isProtected && !isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname =
      pathname === "/reset-password" ? "/forgot-password" : "/login";
    redirectUrl.search = "";
    if (pathname !== "/reset-password") {
      redirectUrl.searchParams.set(
        "next",
        getSafeNextPath(`${pathname}${request.nextUrl.search}`),
      );
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthenticated && guestOnlyRoutes.includes(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/account";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
