import { describe, expect, it } from "vitest";
import { academyLessonRendererKind } from "./AcademyLessonRenderer";

describe("academyLessonRendererKind", () => {
  it.each([
    ["text", "text"],
    ["downloadable", "text"],
    ["video", "video"],
    ["mixed", "video"],
    ["webinar-replay", "webinar-replay"],
    ["chart-practice", "chart-practice"],
    ["external-resource", "external-resource"],
    ["quiz", "assessment"],
    ["assessment", "assessment"],
  ] as const)("maps %s lessons to the %s renderer", (type, expected) => {
    expect(academyLessonRendererKind(type)).toBe(expected);
  });
});
