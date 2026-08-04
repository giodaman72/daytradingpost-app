import "server-only";

import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

export async function getRequestLocale(): Promise<Locale> {
  const requestHeaders = await headers();
  const locale =
    requestHeaders.get("x-dtp-locale") ??
    (await cookies()).get("dtp_locale")?.value;
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

export async function getVisiblePathname(): Promise<string> {
  const pathname =
    (await headers()).get("x-dtp-visible-path") ??
    (await cookies()).get("dtp_visible_path")?.value;
  return pathname ? decodeURIComponent(pathname) : "/";
}
