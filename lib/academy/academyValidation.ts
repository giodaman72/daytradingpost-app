import { AcademyError } from "./academyErrors";

const identifierPattern = /^[a-zA-Z0-9_.-]{1,160}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const verificationPattern = /^[A-Za-z0-9_-]{24,160}$/;

function fail(message: string): never {
  throw new AcademyError("ACADEMY_VALIDATION_FAILED", message);
}

export function parseAcademyIdentifier(value: unknown, label = "identifier") {
  if (typeof value !== "string" || !identifierPattern.test(value.trim()))
    fail(`Invalid ${label}.`);
  return value.trim();
}

export function parseAcademySlug(value: unknown) {
  if (typeof value !== "string" || !slugPattern.test(value.trim()))
    fail("Invalid course slug.");
  return value.trim();
}

export function parseVerificationCode(value: unknown) {
  if (typeof value !== "string" || !verificationPattern.test(value.trim()))
    fail("Invalid certificate verification code.");
  return value.trim();
}

export function parsePercent(value: unknown, label = "progress") {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  )
    fail(`${label} must be between 0 and 100.`);
  return Math.round(value * 100) / 100;
}

export function parseVideoPosition(value: unknown, duration: number) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > duration
  )
    fail("Invalid video position.");
  return Math.floor(value);
}

export function parsePagination(url: URL, maximum = 100) {
  const limit = Math.min(
    maximum,
    Math.max(1, Number(url.searchParams.get("limit")) || 20),
  );
  const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
  return { limit, offset };
}

export function parseJsonObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail("Expected an object.");
  return value as Record<string, unknown>;
}

export function normalizePlainText(
  value: unknown,
  label: string,
  maximum: number,
) {
  if (typeof value !== "string") fail(`${label} is required.`);
  const normalized = value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  if (!normalized || normalized.length > maximum)
    fail(`${label} must be between 1 and ${maximum} characters.`);
  return normalized;
}

export function isSafeInternalPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
  );
}
