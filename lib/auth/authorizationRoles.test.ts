import { describe, expect, it } from "vitest";
import { isMarketEditorRole } from "./authorizationRoles";

describe("market editor authorization", () => {
  it.each(["editor", "admin"])("allows %s", (role) =>
    expect(isMarketEditorRole(role)).toBe(true),
  );
  it.each(["member", null, undefined, "owner"])("denies %s", (role) =>
    expect(isMarketEditorRole(role)).toBe(false),
  );
});
