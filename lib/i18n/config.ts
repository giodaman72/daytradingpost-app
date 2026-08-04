export const SUPPORTED_LOCALES = ["en", "es"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const SPANISH_PREFIX = "/es";

const SPANISH_PUBLIC_PATHS = [
  "/about",
  "/academy",
  "/analysis",
  "/charts",
  "/contact",
  "/economic-calendar",
  "/forgot-password",
  "/login",
  "/markets",
  "/premium",
  "/privacy",
  "/register",
  "/reset-password",
  "/terms",
  "/webinars",
] as const;

export function isSpanishPublicPath(pathname: string): boolean {
  const basePath = stripLocalePrefix(pathname).split(/[?#]/, 1)[0] || "/";
  return (
    basePath === "/" ||
    SPANISH_PUBLIC_PATHS.some(
      (prefix) => basePath === prefix || basePath.startsWith(`${prefix}/`),
    )
  );
}

export function isLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function localizeHref(href: string, locale: Locale): string {
  if (
    locale === DEFAULT_LOCALE ||
    !href.startsWith("/") ||
    href.startsWith("/api/") ||
    !isSpanishPublicPath(href) ||
    href.startsWith(`${SPANISH_PREFIX}/`) ||
    href === SPANISH_PREFIX
  ) {
    return href;
  }

  return href === "/" ? SPANISH_PREFIX : `${SPANISH_PREFIX}${href}`;
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === SPANISH_PREFIX) return "/";
  if (pathname.startsWith(`${SPANISH_PREFIX}/`)) {
    return pathname.slice(SPANISH_PREFIX.length) || "/";
  }
  return pathname;
}

export function switchLocaleHref(pathname: string, locale: Locale): string {
  const basePath = stripLocalePrefix(pathname);
  return locale === "es" ? basePath : localizeHref(basePath, "es");
}

export function localizedCanonical(pathname: string, locale: Locale): string {
  return localizeHref(stripLocalePrefix(pathname), locale);
}

export function languageAlternates(pathname: string) {
  const basePath = stripLocalePrefix(pathname);
  return {
    "en-US": basePath,
    es: localizeHref(basePath, "es"),
    "x-default": basePath,
  } as const;
}
