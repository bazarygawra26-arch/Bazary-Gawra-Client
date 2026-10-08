import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { env } from '../../config/env';

/**
 * Server-side Supabase client using environment variables from .env.local
 */
export function createServerClient() {
  const url = (env.SUPABASE_URL || '').trim();
  const key = (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || '').trim();

  if (!url || !key || !url.startsWith('http')) {
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
    console.error('Failed to initialize server Supabase client:', err);
    return null;
  }
}

export const supabaseServer = createServerClient();
