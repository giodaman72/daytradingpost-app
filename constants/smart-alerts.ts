import type { AlertType } from "@/types/alert";
export const WATCHLIST_LIMITS = {
  free: {
    watchlists: 1,
    instrumentsPerWatchlist: 5,
    activeAlerts: 3,
    historyDays: 30,
    email: false,
  },
  premium: {
    watchlists: 10,
    instrumentsPerWatchlist: 25,
    activeAlerts: 50,
    historyDays: 365,
    email: true,
  },
} as const;
export const ADVANCED_ALERT_TYPES: AlertType[] = [
  "percentage_change_above",
  "percentage_change_below",
  "market_bias_changed",
  "support_level_reached",
  "resistance_level_reached",
  "new_market_intelligence",
];
export const ALERT_DEFAULT_COOLDOWN_MINUTES = 60;
export const ALERT_MIN_COOLDOWN_MINUTES = 15;
export const ALERT_MAX_COOLDOWN_MINUTES = 10_080;
export const ALERT_MAX_BATCH_SIZE = 100;
export const WATCHLIST_NAME_MAX_LENGTH = 60;
export const WATCHLIST_DESCRIPTION_MAX_LENGTH = 240;
export const WATCHLIST_NOTES_MAX_LENGTH = 500;
export function getSmartFeatureLimits(hasPremiumAccess: boolean) {
  return hasPremiumAccess ? WATCHLIST_LIMITS.premium : WATCHLIST_LIMITS.free;
}
