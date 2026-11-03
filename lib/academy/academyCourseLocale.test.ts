import { describe, expect, it, vi } from "vitest";

const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});
let requestLocale: "en" | "es" = "en";

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/i18n/server", () => ({
  getRequestLocale: async () => requestLocale,
}));

const {
  academyCourseHref,
  academyCourseLocale,
  academyCoursesForLocale,
  enforceAcademyCourseLocale,
} = await import("./academyCourseLocale");

describe("Academy course locale", () => {
  const english = { id: "en", language: "en" as const };
  const spanish = { id: "es", language: "es" as const };
  const legacy: { id: string; language?: "en" | "es" } = { id: "legacy" };

  it("treats courses without a language as English", () => {
    expect(academyCourseLocale(legacy)).toBe("en");
    expect(academyCourseLocale(spanish)).toBe("es");
  });

  it("lists only the courses taught in the site locale", () => {
    const courses = [english, spanish, legacy];
    expect(academyCoursesForLocale(courses, "es")).toEqual([spanish]);
    expect(academyCoursesForLocale(courses, "en")).toEqual([english, legacy]);
  });

  it("links each course inside its own language section", () => {
    expect(academyCourseHref(spanish, "/academy/courses/nivel-1")).toBe(
      "/es/academy/courses/nivel-1",
    );
    expect(academyCourseHref(english, "/academy/courses/level-1")).toBe(
      "/academy/courses/level-1",
    );
  });

  it("redirects a course requested from the other locale", async () => {
    requestLocale = "en";
    await expect(
      enforceAcademyCourseLocale(spanish, "/academy/courses/nivel-1"),
    ).rejects.toThrow("NEXT_REDIRECT:/es/academy/courses/nivel-1");
    requestLocale = "es";
    await expect(
      enforceAcademyCourseLocale(english, "/academy/courses/level-1"),
    ).rejects.toThrow("NEXT_REDIRECT:/academy/courses/level-1");
    await expect(
      enforceAcademyCourseLocale(spanish, "/academy/courses/nivel-1"),
    ).resolves.toBeUndefined();
  });
});
