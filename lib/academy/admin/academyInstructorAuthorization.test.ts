import { describe, expect, it } from "vitest";
import { instructorOwnsCourse } from "./academyInstructorAuthorization";

const assignments = [
  { courseId: "course-a", instructorId: "instructor-a", userId: "user-a" },
];

describe("Academy instructor ownership", () => {
  it("allows only explicitly assigned courses", () => {
    expect(instructorOwnsCourse(assignments, "course-a")).toBe(true);
    expect(instructorOwnsCourse(assignments, "course-b")).toBe(false);
  });
});
