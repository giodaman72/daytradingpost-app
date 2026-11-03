import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  academyLessonKicker,
  academyLessonText,
  academyLockedMessage,
  academyStatusLabel,
} from "./academyLessonText";

const LESSON_FILES = [
  "app/academy/courses/[courseSlug]/learn/page.tsx",
  "app/academy/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx",
  "components/academy/AcademyLessonRenderer.tsx",
  "components/academy/AcademyLockedState.tsx",
  "components/academy/AcademyVideoPlayer.tsx",
  "components/academy/AssessmentLauncher.tsx",
  "components/academy/LessonCurriculumNavigation.tsx",
  "components/academy/LessonProgressControls.tsx",
  "components/academy/LessonResources.tsx",
  "components/academy/LessonTools.tsx",
  "components/academy/tutor/AcademyTutorLessonActions.tsx",
];

describe("Academy lesson text", () => {
  it("returns English unchanged and Spanish translations", () => {
    expect(academyLessonText("en")("Bookmarks")).toBe("Bookmarks");
    expect(academyLessonText("es")("Bookmarks")).toBe("Marcadores");
    expect(academyLessonText("es")("Back to curriculum")).toBe(
      "Volver al temario",
    );
  });

  it("has a Spanish translation for every string the lesson workspace translates", () => {
    const es = academyLessonText("es");
    const missing: string[] = [];
    for (const file of LESSON_FILES) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/\btr\("((?:[^"\\]|\\.)*)"\)/g)) {
        const english = JSON.parse(`"${match[1]}"`) as string;
        if (es(english) === english) missing.push(`${file}: ${english}`);
      }
    }
    expect(missing).toEqual([]);
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
