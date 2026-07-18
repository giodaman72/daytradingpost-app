import "server-only";

import { getMarketEditorAccess } from "@/lib/auth/adminAuthorization";
import type { AppRole } from "@/lib/auth/authorizationRoles";
import { AcademyError } from "../academyErrors";

export const ACADEMY_PERMISSIONS = [
  "academy:view",
  "academy:create",
  "academy:edit",
  "academy:publish",
  "academy:archive",
  "academy:manage-assessments",
  "academy:view-analytics",
  "academy:manage-certificates",
  "academy:manage-enrollments",
  "academy:preview-premium",
] as const;
export type AcademyPermission = (typeof ACADEMY_PERMISSIONS)[number];

const editorPermissions: AcademyPermission[] = [
  "academy:view",
  "academy:create",
  "academy:edit",
  "academy:manage-assessments",
];
const adminPermissions: AcademyPermission[] = [...ACADEMY_PERMISSIONS];

export function permissionsForAcademyRole(role: AppRole) {
  if (role === "admin") return adminPermissions;
  if (role === "editor") return editorPermissions;
  return [];
}

export async function requireAcademyPermission(permission: AcademyPermission) {
  const access = await getMarketEditorAccess();
  if (!access)
    throw new AcademyError(
      "ACADEMY_FORBIDDEN",
      "Academy administrative access is required.",
    );
  if (!permissionsForAcademyRole(access.role).includes(permission))
    throw new AcademyError(
      "ACADEMY_FORBIDDEN",
      "You do not have permission to perform this Academy action.",
    );
  return { permission, role: access.role, userId: access.user.id };
}
