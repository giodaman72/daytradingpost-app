import { describe, expect, it } from "vitest";
import { permissionsForAcademyRole } from "./academyAdminAuthorization";

describe("Academy admin permissions", () => {
  it("keeps content editors outside sensitive learner and publishing operations", () => {
    const permissions = permissionsForAcademyRole("editor");
    expect(permissions).toContain("academy:edit");
    expect(permissions).toContain("academy:manage-assessments");
    expect(permissions).not.toContain("academy:publish");
    expect(permissions).not.toContain("academy:archive");
    expect(permissions).not.toContain("academy:manage-enrollments");
    expect(permissions).not.toContain("academy:manage-certificates");
    expect(permissions).not.toContain("academy:moderate-reviews");
    expect(permissions).not.toContain("academy:view-analytics");
  });

  it("grants the complete Academy permission set only to admins", () => {
    const admin = permissionsForAcademyRole("admin");
    expect(admin).toContain("academy:publish");
    expect(admin).toContain("academy:archive");
    expect(admin).toContain("academy:manage-enrollments");
    expect(admin).toContain("academy:manage-certificates");
    expect(admin).toContain("academy:moderate-reviews");
    expect(admin).toContain("academy:view-analytics");
    expect(permissionsForAcademyRole("member")).toEqual([]);
  });
});
