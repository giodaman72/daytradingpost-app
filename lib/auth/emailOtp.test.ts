import { describe, expect, it } from "vitest";
import {
  getEmailOtpFailurePath,
  getEmailOtpSuccessPath,
  parseSupportedEmailOtpType,
} from "./emailOtp";

describe("email OTP routing", () => {
  it("accepts only the scanner-safe template types", () => {
    expect(parseSupportedEmailOtpType("email")).toBe("email");
    expect(parseSupportedEmailOtpType("recovery")).toBe("recovery");
    expect(parseSupportedEmailOtpType("magiclink")).toBeNull();
    expect(parseSupportedEmailOtpType(null)).toBeNull();
  });

  it("sends recovery sessions to the password form", () => {
    expect(getEmailOtpSuccessPath("recovery")).toBe("/reset-password");
    expect(getEmailOtpSuccessPath("recovery", "es")).toBe("/es/reset-password");
    expect(getEmailOtpSuccessPath("email")).toBe("/account");
    expect(getEmailOtpSuccessPath("email", "es")).toBe("/es/account");
  });

  it("returns an actionable retry destination for invalid links", () => {
    expect(getEmailOtpFailurePath("recovery")).toContain("/forgot-password");
    expect(getEmailOtpFailurePath("email")).toContain("/login");
    expect(decodeURIComponent(getEmailOtpFailurePath(null))).toContain(
      "invalid or expired",
    );
    expect(getEmailOtpFailurePath("email", "es")).toContain("/es/login");
    expect(decodeURIComponent(getEmailOtpFailurePath("email", "es"))).toContain(
      "inválido o ha caducado",
    );
  });
});
