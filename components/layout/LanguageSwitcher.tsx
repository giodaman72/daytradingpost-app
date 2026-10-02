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
  const shortLabel = targetLocale === "es" ? "ES" : "EN";

  return (
    // Locale routes rewrite to the same App Router route. A document navigation
    // ensures the server reads the new locale instead of reusing RSC content.
    <a
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
    </a>
  );
}
