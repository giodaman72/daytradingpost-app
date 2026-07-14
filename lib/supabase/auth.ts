import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { isSupabaseAuthConfigured } from "./config";
import { createClient } from "./server";

export const getCurrentUser = cache(async () => {
  // Always establish a request boundary so pages with the personalized header
  // are never prerendered with a permanently signed-out state.
  await cookies();

  if (!isSupabaseAuthConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});
