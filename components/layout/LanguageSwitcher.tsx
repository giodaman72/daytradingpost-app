import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { switchLocaleHref } from "@/lib/i18n/config";

export function LanguageSwitcher({
  locale,
  pathname,
}: {
  locale: Locale;
  pathname: string;
}) {
  const targetLocale = locale === "es" ? "en" : "es";
  const label = targetLocale === "es" ? "Español" : "English";

  return (
    <Link
      className="language-switcher"
      href={switchLocaleHref(pathname, locale)}
      hrefLang={targetLocale}
      lang={targetLocale}
      aria-label={
        targetLocale === "es"
          ? "Ver esta página en español"
          : "View this page in English"
      }
    >
      {label}
    </Link>
  );
}
