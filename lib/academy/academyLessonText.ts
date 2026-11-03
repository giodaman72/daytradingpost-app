import type { Locale } from "@/lib/i18n/config";
import type {
  AcademyEnrollmentStatus,
  AcademyLessonType,
  AcademyProgressStatus,
} from "@/types/academy";

/**
 * Spanish copy for the learner-facing lesson workspace (lesson page, learn
 * page, video player, progress controls, bookmarks and notes). Keys are the
 * English source strings so components stay readable.
 */
const SPANISH: Record<string, string> = {
  // Lesson page
  "Back to curriculum": "Volver al temario",
  Required: "Obligatoria",
  Optional: "Opcional",
  "Lesson navigation": "Navegación de lecciones",
  Previous: "Anterior",
  Next: "Siguiente",
  "Educational risk notice": "Aviso de riesgo educativo",
  "This lesson is educational and does not provide personalized investment advice or guarantee any trading outcome.":
    "Esta lección es educativa y no constituye asesoría de inversión personalizada ni garantiza ningún resultado en el trading.",
  "Private DayTradingPost Academy lesson.":
    "Lección privada de la Academia DayTradingPost.",
  // Locked state
  "This lesson is locked.": "Esta lección está bloqueada.",
  "Protected course content": "Contenido protegido del curso",
  "Return to curriculum": "Volver al temario",
  "Explore Premium": "Conoce Premium",
  "Complete the earlier lessons to unlock this one.":
    "Completa las lecciones anteriores para desbloquear esta.",
  "Finish this lesson's prerequisites first.":
    "Primero completa los requisitos previos de esta lección.",
  "An active Premium membership is required to continue this course.":
    "Se requiere una membresía Premium activa para continuar este curso.",
  "Premium course access is paused.":
    "El acceso Premium al curso está en pausa.",
  // Curriculum navigation
  "Course curriculum": "Temario del curso",
  "Open course curriculum": "Abrir el temario del curso",
  // Learn page
  "Course overview": "Resumen del curso",
  "Your curriculum": "Tu temario",
  complete: "completado",
  progress: "progreso",
  "No lesson is currently available. Review the prerequisite states below.":
    "Ninguna lección está disponible por ahora. Revisa los requisitos previos más abajo.",
  // Renderer
  "Open video transcript": "Ver la transcripción del video",
  "External educational resource": "Recurso educativo externo",
  "This link leaves DayTradingPost. Review the destination and its terms before continuing.":
    "Este enlace sale de DayTradingPost. Revisa el destino y sus condiciones antes de continuar.",
  "Open approved external resource": "Abrir el recurso externo aprobado",
  "This external resource is unavailable.":
    "Este recurso externo no está disponible.",
  "Practice foundation": "Base práctica",
  "Chart practice workspace": "Espacio de práctica con gráficos",
  "Interactive chart integration is not available in this repository. Use the lesson instructions and any provided historical examples. Nothing shown here is a live quote or trade recommendation.":
    "La integración de gráficos interactivos aún no está disponible. Usa las instrucciones de la lección y los ejemplos históricos proporcionados. Nada de lo que se muestra aquí es una cotización en vivo ni una recomendación de trading.",
  "Recorded webinar replay.": "Repetición de webinar grabado.",
  "Market commentary and prices discussed in this recording are historical, not current.":
    "Los comentarios y precios de esta grabación son históricos, no actuales.",
  "Review the lesson material before starting. A formal attempt begins only after you activate the assessment control below.":
    "Revisa el material de la lección antes de empezar. El intento formal comienza solo cuando actives el control de evaluación de abajo.",
  // Video player
  "Progress is saved as you watch.":
    "Tu progreso se guarda mientras ves el video.",
  "Progress saved.": "Progreso guardado.",
  "Progress could not be saved. Keep this page open and retry.":
    "No se pudo guardar el progreso. Mantén esta página abierta e inténtalo de nuevo.",
  "This lesson video is not currently available. The text and resources below remain accessible.":
    "El video de esta lección no está disponible por ahora. El texto y los recursos de abajo siguen disponibles.",
  "Academy lesson video": "Video de la lección",
  watched: "visto",
  // Resources
  "Course materials": "Materiales del curso",
  "Lesson resources": "Recursos de la lección",
  Download: "Descargar",
  Open: "Abrir",
  // Progress controls and assessments
  "Lesson progress": "Progreso de la lección",
  "Lesson completed": "Lección completada",
  "Keep your progress moving": "Sigue avanzando",
  "Your course progress has been updated.":
    "Tu progreso en el curso se actualizó.",
  "Watch the required portion of the video. Progress saves automatically.":
    "Mira la parte requerida del video. El progreso se guarda automáticamente.",
  "Pass the assessment to complete this lesson.":
    "Aprueba la evaluación para completar esta lección.",
  "Mark this lesson complete when you have finished the material.":
    "Marca esta lección como completada cuando termines el material.",
  "Saving…": "Guardando…",
  "Mark lesson complete": "Marcar lección como completada",
  "Lesson progress could not be started.":
    "No se pudo iniciar el progreso de la lección.",
  "Lesson completion could not be saved.":
    "No se pudo guardar la lección como completada.",
  "Start assessment": "Comenzar evaluación",
  "Preparing assessment…": "Preparando la evaluación…",
  "The assessment could not be started.": "No se pudo iniciar la evaluación.",
  // AI tutor entry
  "Optional learning support": "Apoyo de aprendizaje opcional",
  "Ask the AI Tutor about this lesson":
    "Pregúntale al tutor de IA sobre esta lección",
  "Nothing is sent until you choose an action and submit. Private notes and assessment answers are excluded.":
    "No se envía nada hasta que elijas una acción y la envíes. Tus notas privadas y respuestas de evaluaciones quedan excluidas.",
  "Explain this lesson": "Explícame esta lección",
  "Explain the key concepts in this lesson.":
    "Explica los conceptos clave de esta lección.",
  "Simplify this section": "Simplifica esta sección",
  "Simplify the central concept in this lesson.":
    "Simplifica el concepto central de esta lección.",
  "Give me three review questions": "Dame tres preguntas de repaso",
  "Generate three new, ungraded review questions for this lesson.":
    "Genera tres preguntas de repaso nuevas y sin calificación para esta lección.",
  "Explain this chart example": "Explícame el ejemplo del gráfico",
  "Explain the published chart example in this lesson.":
    "Explica el ejemplo de gráfico publicado en esta lección.",
  "Create a study checklist": "Crea una lista de estudio",
  "Create a study checklist for this lesson.":
    "Crea una lista de verificación de estudio para esta lección.",
  // Bookmarks and notes
  "Lesson tools": "Herramientas de la lección",
  Bookmarks: "Marcadores",
  "Optional label": "Etiqueta opcional",
  "Key idea or timestamp": "Idea clave o minuto",
  Save: "Guardar",
  "Bookmark label": "Etiqueta del marcador",
  "Cancel bookmark editing": "Cancelar la edición del marcador",
  "Lesson bookmark": "Marcador de la lección",
  "Edit bookmark": "Editar marcador",
  "Delete bookmark": "Eliminar marcador",
  "No bookmarks in this lesson yet.": "Aún no hay marcadores en esta lección.",
  "Bookmark saved.": "Marcador guardado.",
  "Bookmark could not be saved.": "No se pudo guardar el marcador.",
  "Bookmark label updated.": "Etiqueta del marcador actualizada.",
  "Bookmark could not be updated.": "No se pudo actualizar el marcador.",
  "Bookmark removed.": "Marcador eliminado.",
  "Bookmark could not be deleted.": "No se pudo eliminar el marcador.",
  "Private notes": "Notas privadas",
  Note: "Nota",
  "Capture your own learning notes…": "Escribe tus propias notas de estudio…",
  "Save private note": "Guardar nota privada",
  "Edit private note": "Editar nota privada",
  "Delete private note": "Eliminar nota privada",
  "Save changes": "Guardar cambios",
  Cancel: "Cancelar",
  "Your notes are private and visible only to you.":
    "Tus notas son privadas y solo tú puedes verlas.",
  "Private note saved.": "Nota privada guardada.",
  "Private note could not be saved.": "No se pudo guardar la nota privada.",
  "Private note updated.": "Nota privada actualizada.",
  "Private note could not be updated.":
    "No se pudo actualizar la nota privada.",
  "Private note removed.": "Nota privada eliminada.",
  "Private note could not be deleted.": "No se pudo eliminar la nota privada.",
  "Delete this private note? This cannot be undone.":
    "¿Eliminar esta nota privada? Esta acción no se puede deshacer.",
};

export type AcademyLessonTranslate = (english: string) => string;

/** Returns a translator for lesson-workspace copy in the given locale. */
export function academyLessonText(
  locale: Locale = "en",
): AcademyLessonTranslate {
  return (english) =>
    locale === "es" ? (SPANISH[english] ?? english) : english;
}

const LESSON_TYPE_ES: Record<AcademyLessonType, string> = {
  assessment: "Evaluación",
  "chart-practice": "Práctica con gráficos",
  downloadable: "Material descargable",
  "external-resource": "Recurso externo",
  mixed: "Lección mixta",
  quiz: "Cuestionario",
  text: "Lección de lectura",
  video: "Lección en video",
  "webinar-replay": "Repetición de webinar",
};

/** Kicker label for a lesson, e.g. "Video lesson" / "Lección en video". */
export function academyLessonKicker(type: AcademyLessonType, locale: Locale) {
  if (locale === "es") return LESSON_TYPE_ES[type];
  const label = type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return `${label} lesson`;
}

const STATUS_ES: Record<
  AcademyProgressStatus | AcademyEnrollmentStatus,
  string
> = {
  available: "Disponible",
  completed: "Completada",
  enrolled: "Inscrito",
  in_progress: "En curso",
  locked: "Bloqueada",
  not_started: "Sin empezar",
  paused: "En pausa",
  reset: "Reiniciada",
  skipped: "Omitida",
} as Record<AcademyProgressStatus | AcademyEnrollmentStatus, string>;

/** Human label for a lesson or enrollment status. */
export function academyStatusLabel(status: string, locale: Locale) {
  if (locale === "es")
    return (
      (STATUS_ES as Record<string, string>)[status] ??
      status.replaceAll("_", " ")
    );
  return status.replaceAll("_", " ");
}

const LOCKED_MESSAGES: Record<string, string> = {
  ACADEMY_LESSON_LOCKED: "Complete the earlier lessons to unlock this one.",
  ACADEMY_PREMIUM_REQUIRED:
    "An active Premium membership is required to continue this course.",
  ACADEMY_PREREQUISITE_NOT_MET: "Finish this lesson's prerequisites first.",
};

/** Locked-lesson message: server text in English, translated copy in Spanish. */
export function academyLockedMessage(
  code: string,
  serverMessage: string,
  locale: Locale,
) {
  if (locale !== "es") return serverMessage;
  return academyLessonText(locale)(LOCKED_MESSAGES[code] ?? serverMessage);
}
