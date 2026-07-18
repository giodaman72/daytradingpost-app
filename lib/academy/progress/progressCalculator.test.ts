import { describe, expect, it } from "vitest";
import {
  calculateCourseProgress,
  calculateModuleProgress,
  calculateVideoProgress,
  evaluateCourseCompletion,
} from "./progressCalculator";

const lesson = (lessonId: string, status: "completed" | "in_progress") => ({
  lessonId,
  status,
});
const moduleItem = (moduleId: string, status: "completed" | "in_progress") => ({
  moduleId,
  status,
});

describe("Academy progress engine", () => {
  it("calculates required lesson progress without counting optional lessons", () => {
    expect(
      calculateModuleProgress(
        ["l1", "l2"],
        [lesson("l1", "completed"), lesson("optional", "completed")],
      ),
    ).toMatchObject({
      completed: false,
      completedRequiredLessonsCount: 1,
      progressPercent: 50,
    });
  });

  it("does not exceed 100 percent", () => {
    expect(
      calculateModuleProgress(
        ["l1"],
        [lesson("l1", "completed"), lesson("l2", "completed")],
      ).progressPercent,
    ).toBe(100);
  });

  it("does not complete an empty course unexpectedly", () => {
    expect(calculateCourseProgress([], [], [], []).courseCompleted).toBe(false);
  });

  it("calculates combined module and lesson progress", () => {
    expect(
      calculateCourseProgress(
        ["m1", "m2"],
        [moduleItem("m1", "completed")],
        ["l1", "l2"],
        [lesson("l1", "completed")],
      ).coursePercent,
    ).toBe(50);
  });

  it("requires a final assessment when configured", () => {
    const result = evaluateCourseCompletion({
      finalAssessmentPassed: false,
      minimumAssessmentRequired: true,
      requiredLessonIds: ["l1"],
      requiredModuleIds: ["m1"],
      lessonProgress: [lesson("l1", "completed")],
      moduleProgress: [moduleItem("m1", "completed")],
      now: "2026-02-01T00:00:00.000Z",
    });
    expect(result.completed).toBe(false);
    expect(result.unmetRequirements).toEqual(["final-assessment"]);
  });

  it("preserves historical completion after structural changes", () => {
    expect(
      evaluateCourseCompletion({
        finalAssessmentPassed: null,
        minimumAssessmentRequired: false,
        requiredLessonIds: ["new-lesson"],
        requiredModuleIds: [],
        lessonProgress: [],
        moduleProgress: [],
        previouslyCompletedAt: "2026-01-01T00:00:00.000Z",
      }),
    ).toMatchObject({ completed: true, progressPercent: 100 });
  });

  it("enforces monotonic video progress", () => {
    expect(
      calculateVideoProgress({
        completionPercent: 80,
        currentPositionSeconds: 20,
        durationSeconds: 100,
        endThresholdSeconds: 10,
        previousPositionSeconds: 60,
      }).positionSeconds,
    ).toBe(60);
  });

  it("completes video at percentage threshold", () => {
    expect(
      calculateVideoProgress({
        completionPercent: 80,
        currentPositionSeconds: 80,
        durationSeconds: 100,
        endThresholdSeconds: 10,
        previousPositionSeconds: 60,
      }).completed,
    ).toBe(true);
  });

  it("completes video near its end", () => {
    expect(
      calculateVideoProgress({
        completionPercent: 95,
        currentPositionSeconds: 91,
        durationSeconds: 100,
        endThresholdSeconds: 10,
        previousPositionSeconds: 0,
      }).completed,
    ).toBe(true);
  });
});
