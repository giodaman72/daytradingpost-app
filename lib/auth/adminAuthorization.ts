import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isMarketEditorRole, type AppRole } from "./authorizationRoles";

export { isMarketEditorRole, type AppRole } from "./authorizationRoles";

export async function getMarketEditorAccess() {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("profiles")
      .select("app_role")
      .eq("id", user.id)
      .maybeSingle<{ app_role: AppRole }>();

    if (error || !isMarketEditorRole(data?.app_role)) return null;
    return { user, role: data.app_role };
  } catch {
    return null;
  }
}

export async function requireMarketEditor() {
  const access = await getMarketEditorAccess();
  if (!access) redirect("/account?notice=editor-access-required");
  return access;
}
