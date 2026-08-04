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
  "/assistant",
  "/admin/ai",
  "/members",
  ROUTES.membership.success,
  ROUTES.membership.pending,
];
const guestOnlyRoutes: readonly string[] = [
  ROUTES.auth.login,
  ROUTES.auth.register,
];

type SessionProxyOptions = {
  pathname?: string;
  requestHeaders?: Headers;
  rewriteUrl?: URL;
  localePrefix?: string;
};

export async function updateSession(
  request: NextRequest,
  options: SessionProxyOptions = {},
) {
  const createResponse = () =>
    options.rewriteUrl
      ? NextResponse.rewrite(options.rewriteUrl, {
          request: { headers: options.requestHeaders },
        })
      : NextResponse.next({
          request: {
            headers: options.requestHeaders ?? request.headers,
          },
        });

  if (!isSupabaseAuthConfigured()) {
    return createResponse();
  }

  let response = createResponse();
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
        response = createResponse();
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);
  const pathname = options.pathname ?? request.nextUrl.pathname;
  const isProtected =
    protectedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) || pathname === "/reset-password";

  if (isProtected && !isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `${options.localePrefix ?? ""}${
      pathname === "/reset-password" ? "/forgot-password" : "/login"
    }`;
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
