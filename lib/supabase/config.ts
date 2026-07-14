const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publicSupabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export function isSupabaseAuthConfigured() {
  return Boolean(publicSupabaseUrl && publicSupabaseKey);
}

export function getSupabaseAuthConfig() {
  if (!publicSupabaseUrl || !publicSupabaseKey) {
    throw new Error("Supabase authentication is not configured.");
  }

  return {
    url: publicSupabaseUrl,
    publishableKey: publicSupabaseKey,
  };
}
