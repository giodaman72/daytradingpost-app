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
  // AI tutor page
  "Course AI Tutor": "Tutor de IA del curso",
  "Private, source-grounded AI Tutor for an Academy course.":
    "Tutor de IA privado, basado en las fuentes de un curso de la Academia.",
  "Private Academy workspace": "Espacio privado de la Academia",
  Tutor: "Tutor",
  "Context is limited to content your account can access. Private notes, answer keys, drafts, and other learners are excluded.":
    "El contexto se limita al contenido al que tu cuenta tiene acceso. Se excluyen las notas privadas, las claves de respuestas, los borradores y otros estudiantes.",
  "This course Tutor could not load.": "No se pudo cargar el tutor del curso.",
  "Try again": "Intentar de nuevo",
  "Loading course Tutor…": "Cargando el tutor del curso…",
  "Lesson context": "Contexto de la lección",
  "Published Academy context": "Contexto publicado de la Academia",
  "Explain the key ideas in this lesson.":
    "Explica las ideas clave de esta lección.",
  "Simplify this concept with an educational example.":
    "Simplifica este concepto con un ejemplo educativo.",
  "Give me three AI-generated review questions.":
    "Dame tres preguntas de repaso generadas por IA.",
  "Create a study checklist for this topic.":
    "Crea una lista de estudio para este tema.",
  "What educational topic should I study next?":
    "¿Qué tema debería estudiar a continuación?",
  "Generation stopped. Any partial response has been preserved.":
    "Generación detenida. Se conservó la respuesta parcial.",
  "The Academy Tutor is unavailable.":
    "El tutor de la Academia no está disponible.",
  "Learning action": "Acción de aprendizaje",
  "Explain lesson": "Explicar la lección",
  "Simplify concept": "Simplificar un concepto",
  "Summarize lesson": "Resumir la lección",
  "Lesson question": "Pregunta sobre la lección",
  "Practice questions": "Preguntas de práctica",
  "Explain quiz feedback": "Explicar la retroalimentación del cuestionario",
  "Glossary help": "Ayuda con el glosario",
  "Compare concepts": "Comparar conceptos",
  "Study checklist": "Lista de estudio",
  "Recommend next topic": "Recomendar el siguiente tema",
  "Ask the Academy Tutor": "Pregúntale al tutor de la Academia",
  "Ask about this lesson, a glossary term, or request ungraded practice…":
    "Pregunta sobre esta lección, un término del glosario o pide práctica sin calificación…",
  "Stop generating": "Detener",
  "Ask Tutor": "Preguntar al tutor",
  "Academy Tutor conversation": "Conversación con el tutor de la Academia",
  "DTP Academy Tutor": "Tutor de la Academia DTP",
  You: "Tú",
  Academy: "Academia",
  "Academy Tutor": "Tutor de la Academia",
  "Educational Tutor with assessment boundaries":
    "Tutor educativo con límites en las evaluaciones",
  "AI explanations may be incomplete or mistaken. The Tutor cannot answer graded assessments, reveal answer keys, issue certificates, give personalized investment advice, or promise trading results. Check every cited lesson and source.":
    "Las explicaciones de la IA pueden ser incompletas o tener errores. El tutor no puede responder evaluaciones calificadas, revelar claves de respuestas, emitir certificados, dar asesoría de inversión personalizada ni prometer resultados en el trading. Verifica cada lección y fuente citada.",
  "Study from authorized Academy sources.":
    "Estudia con fuentes autorizadas de la Academia.",
  "Ask about": "Pregunta sobre",
  "Choose a learning action or write a question. The Tutor runs only after you submit and never receives private notes by default.":
    "Elige una acción de aprendizaje o escribe una pregunta. El tutor solo se ejecuta cuando envías y nunca recibe tus notas privadas por defecto.",
  // Shared assistant components
  "Conversation history": "Historial de conversaciones",
  New: "Nueva",
  Rename: "Renombrar",
  Archive: "Archivar",
  Restore: "Restaurar",
  Delete: "Eliminar",
  "No saved conversations yet.": "Aún no hay conversaciones guardadas.",
  "Delete this conversation and its messages permanently?":
    "¿Eliminar esta conversación y sus mensajes de forma permanente?",
  "Conversation title": "Título de la conversación",
  "Daily usage": "Uso diario",
  "questions left": "preguntas restantes",
  "daily questions used": "preguntas diarias usadas",
  of: "de",
  "Premium allowance": "Cupo Premium",
  "Free allowance": "Cupo gratuito",
  "DayTradingPost source": "fuente de DayTradingPost",
  "DayTradingPost sources": "fuentes de DayTradingPost",
  "Source date unavailable": "Fecha de la fuente no disponible",
  "Delayed data": "Datos con retraso",
  "Development fixture": "Dato de prueba",
  "Rate this answer": "Califica esta respuesta",
  "Was this useful?": "¿Te fue útil?",
  "Feedback reason": "Motivo de la valoración",
  Helpful: "Útil",
  "Not helpful": "No fue útil",
  Incorrect: "Incorrecta",
  Outdated: "Desactualizada",
  "Missing citation": "Falta una cita",
  Unsafe: "Insegura",
  Other: "Otro",
  "Optional feedback comment": "Comentario opcional",
  "Optional comment": "Comentario opcional",
  "Mark answer helpful": "Marcar la respuesta como útil",
  "Mark answer not helpful": "Marcar la respuesta como no útil",
  Yes: "Sí",
  No: "No",
  "Feedback saved": "Valoración guardada",
  "Could not save feedback": "No se pudo guardar la valoración",
  "Copy assistant answer": "Copiar la respuesta",
  Copied: "Copiado",
  Copy: "Copiar",
  "Suggested questions": "Preguntas sugeridas",
  "Premium source": "Fuente Premium",
  Citation: "Cita",
  article: "artículo",
  market_intelligence: "inteligencia de mercado",
  market_data: "datos de mercado",
  economic_event: "evento económico",
  academy: "Academia",
  watchlist: "lista de seguimiento",
};

/** Spanish messages for server error codes (Academy and AI assistant). */
const ERROR_CODE_ES: Record<string, string> = {
  ACADEMY_UNAUTHENTICATED: "Inicia sesión para continuar.",
  ACADEMY_FORBIDDEN: "No tienes permiso para realizar esta acción.",
  ACADEMY_COURSE_NOT_FOUND: "Este curso no está disponible.",
  ACADEMY_LESSON_NOT_FOUND: "Esta lección no está disponible.",
  ACADEMY_NOT_ENROLLED: "Inscríbete en el curso para continuar.",
  ACADEMY_ALREADY_ENROLLED: "Ya estás inscrito en este curso.",
  ACADEMY_REVIEW_EXISTS: "Ya publicaste una reseña de este curso.",
  ACADEMY_REVIEW_NOT_ELIGIBLE:
    "Aún no cumples los requisitos para reseñar este curso.",
  ACADEMY_REVIEW_NOT_FOUND: "No se encontró la reseña.",
  ACADEMY_PREMIUM_REQUIRED:
    "Se requiere una membresía Premium activa para continuar este curso.",
  ACADEMY_PREREQUISITE_NOT_MET:
    "Primero completa los requisitos previos de esta lección.",
  ACADEMY_LESSON_LOCKED:
    "Completa las lecciones anteriores para desbloquear esta.",
  ACADEMY_ASSESSMENT_NOT_AVAILABLE: "Esta evaluación no está disponible.",
  ACADEMY_ATTEMPT_LIMIT_REACHED:
    "Alcanzaste el número máximo de intentos de esta evaluación.",
  ACADEMY_ATTEMPT_EXPIRED: "El tiempo de este intento terminó.",
  ACADEMY_ATTEMPT_ALREADY_SUBMITTED: "Este intento ya fue enviado.",
  ACADEMY_INVALID_RESPONSE: "Revisa tu respuesta e inténtalo de nuevo.",
  ACADEMY_COMPLETION_REQUIREMENTS_NOT_MET:
    "Aún no cumples los requisitos para completar esto.",
  ACADEMY_CERTIFICATE_NOT_ELIGIBLE:
    "Aún no cumples los requisitos para el certificado.",
  ACADEMY_CERTIFICATE_REVOKED: "Este certificado fue revocado.",
  ACADEMY_RATE_LIMITED:
    "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.",
  ACADEMY_VALIDATION_FAILED: "La solicitud no es válida.",
  ACADEMY_PROVIDER_UNAVAILABLE:
    "El servicio no está disponible por ahora. Inténtalo más tarde.",
  ACADEMY_REQUEST_FAILED: "No se pudo completar la solicitud.",
  AUTH_REQUIRED: "Inicia sesión para usar el tutor.",
  FORBIDDEN: "No tienes permiso para realizar esta acción.",
  INVALID_REQUEST: "La solicitud no es válida.",
  LIMIT_REACHED: "Alcanzaste tu límite diario de preguntas.",
  RATE_LIMITED:
    "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.",
  CONFLICT: "La solicitud entra en conflicto con otra en curso.",
  NOT_FOUND: "No se encontró lo que buscas.",
  PROVIDER_UNAVAILABLE:
    "El tutor no está disponible por ahora. Inténtalo más tarde.",
  PROVIDER_TIMEOUT:
    "El tutor tardó demasiado en responder. Inténtalo de nuevo.",
  PROVIDER_ERROR: "El tutor no pudo generar una respuesta. Inténtalo de nuevo.",
  NO_CONTEXT:
    "No hay suficiente material publicado para responder esa pregunta.",
  INTERNAL_ERROR: "Ocurrió un error inesperado. Inténtalo de nuevo.",
};

/**
 * User-facing text for a failed request. English shows the server message;
 * Spanish maps the error code to Spanish copy, falling back to the
 * translated generic message.
 */
export function academyErrorText(
  error: unknown,
  fallback: string,
  locale: Locale = "en",
  code?: string | null,
) {
  const errorCode =
    code ??
    (error && typeof error === "object" && "code" in error
      ? String((error as { code: unknown }).code)
      : null);
  if (locale === "es")
    return (
      (errorCode ? ERROR_CODE_ES[errorCode] : undefined) ??
      academyLessonText("es")(fallback)
    );
  return error instanceof Error && error.message ? error.message : fallback;
}

export type AcademyLessonTranslate = (english: string) => string;

/** True when the Spanish dictionary has an entry for this English string. */
export function academyHasSpanish(english: string) {
  return Object.hasOwn(SPANISH, english);
}

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
