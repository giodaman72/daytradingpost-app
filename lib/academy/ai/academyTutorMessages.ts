import type { AssistantMessage } from "@/types/ai-message";

export function filterAuthorizedTutorMessages(
  messages: AssistantMessage[],
  hasPremiumAccess: boolean,
  academyCourseSlug?: string | null,
) {
  return messages.filter(
    (message) =>
      (hasPremiumAccess ||
        !message.citations.some((citation) => citation.premium)) &&
      (message.sourceContext?.academyCourseSlug ?? null) ===
        (academyCourseSlug ?? null),
  );
}

export function isTutorConversationContextCompatible(
  messages: AssistantMessage[],
  academyCourseSlug?: string | null,
) {
  const priorCourseSlugs = new Set(
    messages.map((message) => message.sourceContext?.academyCourseSlug ?? null),
  );
  return (
    priorCourseSlugs.size === 0 ||
    (priorCourseSlugs.size === 1 &&
      priorCourseSlugs.has(academyCourseSlug ?? null))
  );
}
