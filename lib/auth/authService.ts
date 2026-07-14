import "server-only";

import { getCurrentUser } from "@/lib/supabase/auth";
import type { AuthUserSummary } from "@/types/profile";

export async function getAuthenticatedUser() {
  return getCurrentUser();
}

export async function getAuthUserSummary(): Promise<AuthUserSummary | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  return { email: user.email ?? null, id: user.id };
}
