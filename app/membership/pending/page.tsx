import type { Metadata } from "next";
import { MembershipStatusPage } from "@/components/membership/MembershipStatusPage";
import { getMembershipAccess } from "@/lib/payments";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "es" ? "Membresía pendiente" : "Membership pending",
    robots: { index: false },
  };
}

export default async function MembershipPendingPage() {
  const [access, locale] = await Promise.all([
    getMembershipAccess(),
    getRequestLocale(),
  ]);
  const spanish = locale === "es";
  return (
    <MembershipStatusPage
      kicker={spanish ? "Verificación pendiente" : "Verification pending"}
      title={
        spanish
          ? "Estamos verificando tu pago de Revolut."
          : "We are verifying your Revolut payment."
      }
      description={
        spanish
          ? "Conserva la referencia indicada. Las compras mediante enlace de pago requieren verificación administrativa y nunca desbloquean contenido Premium automáticamente."
          : "Keep the reference below. Payment-link purchases require administrator verification and never unlock premium content automatically."
      }
      reference={access.profile?.payment_reference}
      locale={locale}
    />
  );
}
