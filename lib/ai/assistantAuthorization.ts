import "server-only";
import { getMembershipAccess } from "@/lib/membership/access";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { AssistantError } from "./assistantErrors";

export async function requireAssistantAccess() {
  const access = await getMembershipAccess();
  if (!access.user)
    throw new AssistantError(
      "AUTH_REQUIRED",
      "Sign in to use the AI Assistant.",
      401,
    );
  return {
    userId: access.user.id,
    hasPremiumAccess: access.hasPremiumAccess,
    accessLevel: access.hasPremiumAccess
      ? ("premium" as const)
      : ("free" as const),
  };
}

export async function requireAssistantAdmin() {
  const access = await requireAssistantAccess();
  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select("app_role")
    .eq("id", access.userId)
    .maybeSingle<{ app_role: string }>();
  if (error || data?.app_role !== "admin")
    throw new AssistantError(
      "FORBIDDEN",
      "Administrator access required.",
      403,
    );
  return { ...access, accessLevel: "admin" as const };
}
