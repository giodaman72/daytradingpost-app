import type { Locale } from "@/lib/i18n/config";

export function NotificationEmptyState({ locale = "en" }: { locale?: Locale }) {
  return (
    <div className="notification-empty">
      <p>
        {locale === "es"
          ? "No hay notificaciones sin leer."
          : "No unread notifications."}
      </p>
    </div>
  );
}
