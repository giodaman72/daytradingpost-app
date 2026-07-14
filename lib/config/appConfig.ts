import { ROUTES } from "@/constants/routes";

export const APP_CONFIG = {
  defaultLocale: "en-US",
  marketTimeZone: "America/New_York",
  name: "DayTradingPost",
  routes: ROUTES,
  siteUrl: "https://daytradingpost.com",
} as const;

export function getPublicSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    APP_CONFIG.siteUrl
  );
}
