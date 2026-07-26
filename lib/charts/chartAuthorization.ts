import "server-only";
import { getMembershipAccess } from "@/lib/membership/access";
import { ChartError } from "./chartErrors";

export const CHART_PLAN_LIMITS = {
  free: { layouts: 1, indicators: 3, sharing: false, premiumOverlays: false },
  premium: { layouts: 20, indicators: 8, sharing: true, premiumOverlays: true },
} as const;
export async function requireChartAccess() {
  const access = await getMembershipAccess();
  if (!access.user)
    throw new ChartError(
      "AUTH_REQUIRED",
      "Sign in to save chart settings.",
      401,
    );
  return {
    userId: access.user.id,
    premium: access.hasPremiumAccess,
    limits: access.hasPremiumAccess
      ? CHART_PLAN_LIMITS.premium
      : CHART_PLAN_LIMITS.free,
  };
}
