import "server-only";

import { getMembershipAccess } from "@/lib/membership/access";
import { AcademyError } from "./academyErrors";
import { getAcademyMembershipLimits } from "./academyConfig";

export async function requireAcademyUser() {
  const access = await getMembershipAccess();
  if (!access.user)
    throw new AcademyError(
      "ACADEMY_UNAUTHENTICATED",
      "Sign in to use the Trading Academy.",
    );
  return {
    hasPremiumAccess: access.hasPremiumAccess,
    limits: getAcademyMembershipLimits(access.hasPremiumAccess),
    profile: access.profile,
    userId: access.user.id,
  };
}
