import { ROUTES } from "@/constants/routes";

export function getSafeNextPath(
  value: unknown,
  fallback: string = ROUTES.account,
) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : fallback;
}
