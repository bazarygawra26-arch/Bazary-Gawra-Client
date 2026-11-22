export const publicEnv = {
  SUPABASE_URL: (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
  SUPABASE_ANON_KEY: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim(),
};
