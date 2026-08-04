import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { formatLocalizedDisplayLabel } from "@/lib/utils";
import type { BillingProfile } from "@/types/profile";
import { DashboardPanel } from "./DashboardPanel";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export function MembershipCard({
  hasPremiumAccess,
  profile,
  locale = "en",
}: {
  hasPremiumAccess: boolean;
  profile: BillingProfile | null;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  const storedStatus = profile?.membership_status || "free";
  const accessStatus =
    storedStatus === "active" && !hasPremiumAccess ? "expired" : storedStatus;
  const membershipTitle = hasPremiumAccess
    ? spanish
      ? "Miembro Premium"
      : "Premium member"
    : accessStatus === "pending"
      ? spanish
        ? "Verificación pendiente"
        : "Verification pending"
      : accessStatus === "expired"
        ? spanish
          ? "El acceso Premium ha caducado"
          : "Premium access expired"
        : spanish
          ? "Membresía gratuita"
          : "Free membership";

  return (
    <DashboardPanel
      id="membership"
      eyebrow={spanish ? "Acceso a la cuenta" : "Account access"}
      title={spanish ? "Tarjeta de membresía" : "Membership Card"}
    >
      <div
        className={`dashboard-membership-card ${hasPremiumAccess ? "active" : "free"}`}
      >
        <div className="dashboard-membership-topline">
          <span>
            <Crown size={22} aria-hidden="true" />
          </span>
          <div>
            <strong>{membershipTitle}</strong>
            <p>
              {spanish ? "Plan" : null}{" "}
              {formatLocalizedDisplayLabel(profile?.membership_plan, {
                fallback: spanish ? "Gratis" : "Free",
                locale,
              })}{" "}
              {spanish ? null : "plan"}
            </p>
          </div>
          <b>
            {formatLocalizedDisplayLabel(accessStatus, {
              fallback: spanish ? "Gratis" : "Free",
              locale,
            })}
          </b>
        </div>
        <ul>
          <li>
            <Check size={15} aria-hidden="true" />
            {spanish
              ? "Panel personal de trading"
              : "Personal trader dashboard"}
          </li>
          <li>
            <Check size={15} aria-hidden="true" />
            {spanish
              ? "Análisis de mercados publicados"
              : "Published market analysis"}
          </li>
          <li>
            <Check size={15} aria-hidden="true" />
            {hasPremiumAccess
              ? spanish
                ? "Informes Premium completos"
                : "Full premium briefings"
              : spanish
                ? "Vistas previas de artículos Premium"
                : "Premium article previews"}
          </li>
        </ul>
        <Link
          href={localizeHref(
            hasPremiumAccess ? "/account/billing" : "/premium",
            locale,
          )}
          className="button button-full"
        >
          {hasPremiumAccess
            ? spanish
              ? "Gestionar membresía"
              : "Manage membership"
            : spanish
              ? "Explorar Premium"
              : "Explore Premium"}
        </Link>
      </div>
    </DashboardPanel>
  );
}
