import type { Locale } from "@/lib/i18n/config";
import type { Notification } from "@/types/notification";

/**
 * Notifications are stored with English copy at creation time. On the
 * Spanish site we translate the known templates at render time, so
 * notifications already in a user's inbox are covered too. Unknown text
 * (for example a user-named alert title) is left as stored.
 */

type Rule = { pattern: RegExp; es: (...groups: string[]) => string };

const TITLES: Record<string, string> = {
  "Course enrollment confirmed": "Inscripción al curso confirmada",
  "Module completed": "Módulo completado",
  "Course completed": "Curso completado",
  "Assessment passed": "Evaluación aprobada",
  "Assessment review recommended":
    "Se recomienda repasar antes de la evaluación",
  "Certificate issued": "Certificado emitido",
  "Learning milestone": "Hito de aprendizaje",
  "Continue learning": "Continúa aprendiendo",
  "Assessment expiry reminder": "Recordatorio de vencimiento de evaluación",
  "Course progress saved": "Progreso del curso guardado",
  "New Academy content": "Nuevo contenido en la Academia",
  "Certificate status updated": "Estado del certificado actualizado",
};

const ALERT_OPERATORS_ES: Record<string, string> = {
  gt: "mayor que",
  gte: "mayor o igual que",
  lt: "menor que",
  lte: "menor o igual que",
  changed: "cambió",
  published: "publicado",
  "scheduled within": "programado dentro de",
  released: "publicado",
};

const MESSAGES: Rule[] = [
  {
    pattern: /^You are enrolled in (.+)\.$/,
    es: (c) => `Te inscribiste en ${c}.`,
  },
  {
    pattern: /^You completed a module in (.+)\.$/,
    es: (c) => `Completaste un módulo de ${c}.`,
  },
  {
    pattern: /^You passed an assessment in (.+)\.$/,
    es: (c) => `Aprobaste una evaluación de ${c}.`,
  },
  {
    pattern: /^Review the course material before your next (.+) attempt\.$/,
    es: (c) =>
      `Repasa el material del curso antes de tu próximo intento en ${c}.`,
  },
  {
    pattern:
      /^Your educational completion certificate for (.+) is available\.$/,
    es: (c) =>
      `Tu certificado educativo de finalización de ${c} está disponible.`,
  },
  {
    pattern: /^You reached a learning-path milestone in (.+)\.$/,
    es: (c) => `Alcanzaste un hito de tu ruta de aprendizaje en ${c}.`,
  },
  {
    pattern: /^Your place in (.+) is saved whenever you are ready\.$/,
    es: (c) => `Tu avance en ${c} está guardado para cuando quieras continuar.`,
  },
  {
    pattern: /^An active assessment in (.+) is approaching its expiry time\.$/,
    es: (c) => `Una evaluación activa de ${c} está por vencer.`,
  },
  {
    pattern: /^You can continue (.+) from your last saved lesson\.$/,
    es: (c) => `Puedes continuar ${c} desde tu última lección guardada.`,
  },
  {
    pattern: /^New published content is available in (.+)\.$/,
    es: (c) => `Hay contenido nuevo publicado en ${c}.`,
  },
  {
    pattern:
      /^Your certificate for (.+) was revoked\. Contact support if you need help\.$/,
    es: (c) =>
      `Tu certificado de ${c} fue revocado. Contacta a soporte si necesitas ayuda.`,
  },
  {
    // Must stay after the more specific "You completed a module" rule.
    pattern: /^You completed (.+)\.$/,
    es: (c) => `Completaste ${c}.`,
  },
  {
    pattern:
      /^(.+) matched (gte|gt|lte|lt|changed|published|scheduled within|released)(?: (.+?))? at (.+?)\.( Source data is delayed\.)?$/,
    es: (instrument, operator, threshold, value, delayed) =>
      `${instrument === "Tracked event" ? "Evento monitoreado" : instrument} cumplió la condición ${ALERT_OPERATORS_ES[operator] ?? operator}${threshold ? ` ${threshold}` : ""} en ${value === "the configured event" ? "el evento configurado" : value}.${delayed ? " Los datos de origen tienen retraso." : ""}`,
  },
];

export function localizeNotificationText(
  notification: Pick<Notification, "title" | "message">,
  locale: Locale,
): { title: string; message: string } {
  if (locale !== "es") {
    return { title: notification.title, message: notification.message };
  }
  const title = TITLES[notification.title] ?? notification.title;
  let message = notification.message;
  for (const rule of MESSAGES) {
    const match = rule.pattern.exec(notification.message);
    if (match) {
      message = rule.es(...match.slice(1).map((group) => group ?? ""));
      break;
    }
  }
  return { title, message };
}
