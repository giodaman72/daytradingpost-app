import { describe, expect, it } from "vitest";
import {
  getNewsletterEmailError,
  normalizeNewsletterEmail,
} from "./newsletter";

describe("newsletter email validation", () => {
  it("normalizes casing and surrounding whitespace", () => {
    expect(normalizeNewsletterEmail("  Trader@Example.COM  ")).toBe(
      "trader@example.com",
    );
  });

  it.each([
    ["", "Enter your email address."],
    ["trader@example", "Enter a valid email address."],
    [
      `${"a".repeat(245)}@example.com`,
      "Email addresses must be 254 characters or fewer.",
    ],
  ])("rejects %p", (email, message) => {
    expect(getNewsletterEmailError(email)).toBe(message);
  });

  it("accepts a normalized valid email address", () => {
    expect(getNewsletterEmailError("trader@example.com")).toBeNull();
  });
});
