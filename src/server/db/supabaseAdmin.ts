import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { env } from '../../config/env';

export function getSupabaseAdmin() {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    return createClient<Database>(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.error('Failed to create Supabase admin client:', err);
    return null;
  }
}

export const supabaseAdmin = getSupabaseAdmin();
