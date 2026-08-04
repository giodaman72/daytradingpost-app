import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  isSpanishPublicPath,
  SPANISH_PREFIX,
  stripLocalePrefix,
} from "@/lib/i18n/config";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const spanishVisiblePath =
    pathname === SPANISH_PREFIX || pathname.startsWith(`${SPANISH_PREFIX}/`);
  const inheritedSpanish = request.headers.get("x-dtp-locale") === "es";
  const spanish = spanishVisiblePath || inheritedSpanish;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-dtp-locale", spanish ? "es" : "en");
  if (!requestHeaders.has("x-dtp-visible-path")) {
    requestHeaders.set("x-dtp-visible-path", pathname);
  }

  // A rewrite re-enters Proxy with the internal English pathname. Preserve the
  // locale carried by the first pass instead of overwriting it with English.
  if (inheritedSpanish && !spanishVisiblePath) {
    return updateSession(request, { requestHeaders });
  }

  if (!spanishVisiblePath) {
    return updateSession(request, { requestHeaders });
  }

  const localizedPathname = stripLocalePrefix(pathname);
  if (!isSpanishPublicPath(localizedPathname)) {
    const englishUrl = request.nextUrl.clone();
    englishUrl.pathname = localizedPathname;
    return NextResponse.redirect(englishUrl);
  }
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = localizedPathname;

  return updateSession(request, {
    localePrefix: SPANISH_PREFIX,
    pathname: localizedPathname,
    requestHeaders,
    rewriteUrl,
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
