import { describe, expect, it } from "vitest";
import { isAdminRole, isMarketEditorRole } from "./authorizationRoles";

describe("market editor authorization", () => {
  it.each(["editor", "admin"])("allows %s", (role) =>
    expect(isMarketEditorRole(role)).toBe(true),
  );
  it.each(["member", null, undefined, "owner"])("denies %s", (role) =>
    expect(isMarketEditorRole(role)).toBe(false),
  );
});

describe("isAdminRole", () => {
  it("allows administrators", () => {
    expect(isAdminRole("admin")).toBe(true);
  });

  it.each(["editor", "member", null, undefined])("denies %s", (role) => {
    expect(isAdminRole(role)).toBe(false);
  });
});
