import type { Metadata } from "next";
import { MembershipStatusPage } from "@/components/membership/MembershipStatusPage";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title:
      locale === "es"
        ? "Pago de membresía cancelado"
        : "Membership checkout cancelled",
    robots: { index: false },
  };
}

export default async function MembershipCancelledPage() {
  const locale = await getRequestLocale();
  const spanish = locale === "es";
  return (
    <MembershipStatusPage
      kicker={spanish ? "Pago cancelado" : "Checkout cancelled"}
      title={
        spanish
          ? "No se realizó ningún cambio en la membresía."
          : "No membership change was made."
      }
      description={
        spanish
          ? "Puedes volver a los planes Premium cuando estés listo. El acceso Premium nunca se concede por un pago incompleto."
          : "You can return to the premium plans whenever you are ready. Premium access is never granted for an incomplete payment."
      }
      tone="cancelled"
      locale={locale}
    />
  );
}
