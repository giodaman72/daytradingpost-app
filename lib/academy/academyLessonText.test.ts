import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AI_CITATION_SOURCE_TYPES } from "@/types/ai-citation";
import {
  academyErrorText,
  academyHasSpanish,
  academyLessonKicker,
  academyLessonText,
  academyLockedMessage,
  academyStatusLabel,
} from "./academyLessonText";

const LESSON_FILES = [
  "app/academy/courses/[courseSlug]/learn/page.tsx",
  "app/academy/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx",
  "app/academy/courses/[courseSlug]/tutor/error.tsx",
  "app/academy/courses/[courseSlug]/tutor/loading.tsx",
  "app/academy/courses/[courseSlug]/tutor/page.tsx",
  "components/academy/AcademyLessonRenderer.tsx",
  "components/academy/AcademyLockedState.tsx",
  "components/academy/AcademyVideoPlayer.tsx",
  "components/academy/AssessmentLauncher.tsx",
  "components/academy/EnrollmentButton.tsx",
  "components/academy/LessonCurriculumNavigation.tsx",
  "components/academy/LessonProgressControls.tsx",
  "components/academy/LessonResources.tsx",
  "components/academy/LessonTools.tsx",
  "components/academy/tutor/AcademyTutorComposer.tsx",
  "components/academy/tutor/AcademyTutorContextBadge.tsx",
  "components/academy/tutor/AcademyTutorConversation.tsx",
  "components/academy/tutor/AcademyTutorDisclaimer.tsx",
  "components/academy/tutor/AcademyTutorEmptyState.tsx",
  "components/academy/tutor/AcademyTutorLessonActions.tsx",
  "components/academy/tutor/AcademyTutorMessage.tsx",
  "components/academy/tutor/AcademyTutorShell.tsx",
  "components/assistant/AssistantCitationItem.tsx",
  "components/assistant/AssistantCitationList.tsx",
  "components/assistant/AssistantCopyButton.tsx",
  "components/assistant/AssistantFeedback.tsx",
  "components/assistant/AssistantHistorySidebar.tsx",
  "components/assistant/AssistantSuggestedPrompts.tsx",
  "components/assistant/AssistantUsageMeter.tsx",
];

/** Quoted English sentences inside a top-level constant of a source file. */
function stringsInConst(file: string, name: string) {
  const source = readFileSync(file, "utf8");
  const start = source.indexOf(`const ${name}`);
  const end = source.indexOf(";\n", start);
  return [...source.slice(start, end).matchAll(/"((?:[^"\\]|\\.)*)"/g)]
    .map((match) => match[1])
    .filter((text) => /^[A-Z][a-z]* /.test(text));
}

describe("Academy lesson text", () => {
  it("returns English unchanged and Spanish translations", () => {
    expect(academyLessonText("en")("Bookmarks")).toBe("Bookmarks");
    expect(academyLessonText("es")("Bookmarks")).toBe("Marcadores");
    expect(academyLessonText("es")("Back to curriculum")).toBe(
      "Volver al temario",
    );
  });

  it("has a Spanish translation for every literal the lesson workspace translates", () => {
    const missing: string[] = [];
    for (const file of LESSON_FILES) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/\btr\(\s*"((?:[^"\\]|\\.)*)"/g)) {
        const english = JSON.parse(`"${match[1]}"`) as string;
        if (!academyHasSpanish(english)) missing.push(`${file}: ${english}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("translates strings passed through variables", () => {
    const variableStrings = [
      ...stringsInConst(
        "components/academy/tutor/AcademyTutorComposer.tsx",
        "LABELS",
      ),
      ...stringsInConst(
        "components/academy/tutor/AcademyTutorShell.tsx",
        "SUGGESTED_PROMPTS",
      ),
      ...stringsInConst(
        "components/academy/tutor/AcademyTutorLessonActions.tsx",
        "ACTIONS",
      ),
      ...AI_CITATION_SOURCE_TYPES,
    ];
    expect(variableStrings.length).toBeGreaterThan(20);
    expect(variableStrings.filter((text) => !academyHasSpanish(text))).toEqual(
      [],
    );
  });

  it("shows Spanish error messages by error code", () => {
    const error = Object.assign(new Error("Daily limit reached."), {
      code: "LIMIT_REACHED",
    });
    expect(academyErrorText(error, "Fallback", "en")).toBe(
      "Daily limit reached.",
    );
    expect(academyErrorText(error, "Fallback", "es")).toBe(
      "Alcanzaste tu límite diario de preguntas.",
    );
    expect(
      academyErrorText(
        new Error("Unknown"),
        "The Academy Tutor is unavailable.",
        "es",
      ),
    ).toBe("El tutor de la Academia no está disponible.");
  });

  it("labels lesson types, statuses and locked messages", () => {
    expect(academyLessonKicker("video", "en")).toBe("Video lesson");
    expect(academyLessonKicker("video", "es")).toBe("Lección en video");
    expect(academyStatusLabel("in_progress", "en")).toBe("in progress");
    expect(academyStatusLabel("in_progress", "es")).toBe("En curso");
    expect(
      academyLockedMessage("ACADEMY_LESSON_LOCKED", "Server text", "en"),
    ).toBe("Server text");
    expect(
      academyLockedMessage("ACADEMY_LESSON_LOCKED", "Server text", "es"),
    ).toBe("Completa las lecciones anteriores para desbloquear esta.");
  });
});
