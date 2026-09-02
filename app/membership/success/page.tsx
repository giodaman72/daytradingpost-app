import type { Metadata } from "next";
import { MembershipStatusPage } from "@/components/membership/MembershipStatusPage";
import { getMembershipAccess } from "@/lib/payments";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title:
      locale === "es"
        ? "Pago de membresía completado"
        : "Membership checkout complete",
    robots: { index: false },
  };
}

export default async function MembershipSuccessPage() {
  const [access, locale] = await Promise.all([
    getMembershipAccess(),
    getRequestLocale(),
  ]);
  const active = access.hasPremiumAccess;
  const spanish = locale === "es";

  return (
    <MembershipStatusPage
      kicker={
        active
          ? spanish
            ? "Membresía activa"
            : "Membership active"
          : spanish
            ? "Pago recibido"
            : "Payment received"
      }
      title={
        active
          ? spanish
            ? "Te damos la bienvenida a DayTradingPost Premium."
            : "Welcome to DayTradingPost Premium."
          : spanish
            ? "Tu pago está en proceso de confirmación."
            : "Your payment is being confirmed."
      }
      description={
        active
          ? spanish
            ? "Tu membresía verificada está activa y el análisis Premium ya está disponible."
            : "Your verified membership is active and premium analysis is now available."
          : spanish
            ? "Revolut te devolvió a DayTradingPost. El acceso permanecerá pendiente hasta que se procese la actualización de pago firmada."
            : "Revolut returned you to DayTradingPost. Access remains pending until the signed payment update is processed."
      }
      reference={access.profile?.payment_reference}
      tone={active ? "success" : "pending"}
      locale={locale}
    />
  );
}
