import { describe, expect, it } from "vitest";
import type {
  AcademyCourseDetail,
  AcademyLearningState,
} from "@/types/academy";
import { deriveAcademyAvailability } from "./academyAvailability";

describe("Academy derived availability", () => {
  it("unlocks a lesson when its current prerequisites are complete", () => {
    const course = {
      modules: [
        {
          id: "module-1",
          prerequisiteModuleIds: [],
          lessons: [
            { id: "lesson-1", prerequisiteLessonIds: [] },
            { id: "lesson-2", prerequisiteLessonIds: ["lesson-1"] },
          ],
        },
      ],
    } as unknown as AcademyCourseDetail;
    const state = {
      lessonProgress: [
        { lessonId: "lesson-1", status: "completed" },
        { lessonId: "lesson-2", status: "locked" },
      ],
      moduleProgress: [{ moduleId: "module-1", status: "available" }],
    } as AcademyLearningState;
    expect(
      deriveAcademyAvailability(course, state).lessonProgress[1].status,
    ).toBe("available");
    expect(state.lessonProgress[1].status).toBe("locked");
  });
});
