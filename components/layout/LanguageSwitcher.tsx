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
  const label = targetLocale === "es" ? "Español" : "Inglés";
  const shortLabel = targetLocale === "es" ? "ES" : "EN";

  return (
    <Link
      className="language-switcher whitespace-nowrap"
      href={switchLocaleHref(pathname, locale)}
      hrefLang={targetLocale}
      lang={targetLocale}
      aria-label={
        targetLocale === "es"
          ? "Ver esta página en español"
          : "Ver esta página en inglés"
      }
    >
      <span className="max-[620px]:hidden">{label}</span>
      <span className="hidden max-[620px]:inline">{shortLabel}</span>
    </Link>
  );
}
