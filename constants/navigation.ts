import { ROUTES } from "./routes";

export const MAIN_NAVIGATION = [
  { href: "/#markets", label: "Markets" },
  { href: ROUTES.analysis, label: "Analysis" },
  { href: ROUTES.economicCalendar, label: "Calendar" },
  { authenticatedOnly: true, href: ROUTES.dashboard, label: "Dashboard" },
  { authenticatedOnly: true, href: ROUTES.assistant, label: "AI Assistant" },
  { authenticatedOnly: true, href: ROUTES.watchlists, label: "Watchlists" },
  { href: ROUTES.academy, label: "Academy" },
  { href: ROUTES.premium, label: "Premium" },
  { href: ROUTES.newsletter, label: "Newsletter" },
] as const;

export const ACCOUNT_NAVIGATION = [
  { href: ROUTES.dashboard, label: "Trader dashboard", section: "dashboard" },
  { href: ROUTES.assistant, label: "AI Assistant", section: "assistant" },
  { href: ROUTES.account, label: "Account overview", section: "overview" },
  { href: ROUTES.billing, label: "Billing & membership", section: "billing" },
  { href: ROUTES.watchlists, label: "Watchlists", section: "watchlists" },
  { href: ROUTES.alerts, label: "Smart alerts", section: "alerts" },
  { href: ROUTES.premium, label: "Premium plans", section: "premium" },
  { href: ROUTES.analysis, label: "Market analysis", section: "analysis" },
] as const;

export const DASHBOARD_NAVIGATION = [
  { href: "#market-outlook", id: "market-outlook", label: "Market outlook" },
  { href: "#latest-analysis", id: "latest-analysis", label: "Latest analysis" },
  {
    href: "#economic-calendar",
    id: "economic-calendar",
    label: "Economic calendar",
  },
  { href: "#webinar", id: "webinar", label: "Webinars" },
  { href: "#watchlist", id: "watchlist", label: "Watchlist" },
  { href: "#smart-alerts", id: "smart-alerts", label: "Smart alerts" },
  { href: "#academy-progress", id: "academy-progress", label: "Academy" },
  { href: "#membership", id: "membership", label: "Membership" },
  { href: "#notifications", id: "notifications", label: "Notifications" },
] as const;

export const FOOTER_NAVIGATION = [
  {
    links: [
      { href: "/markets/gold", label: "Gold" },
      { href: "/markets/indices", label: "Indices" },
      { href: "/markets/forex", label: "Forex" },
      { href: "/markets/crypto", label: "Crypto" },
    ],
    title: "Markets",
  },
  {
    links: [
      { href: ROUTES.academy, label: "Trading Academy" },
      { href: ROUTES.analysis, label: "Market Analysis" },
      { href: ROUTES.economicCalendar, label: "Economic Calendar" },
      { href: ROUTES.webinars, label: "Webinars" },
      { href: ROUTES.premium, label: "Premium" },
    ],
    title: "Learn",
  },
  {
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
    title: "Company",
  },
] as const;
