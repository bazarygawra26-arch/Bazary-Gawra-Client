import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { env } from '../../config/env';

export function getSupabaseAdmin() {
  const rawUrl = (env.SUPABASE_URL || 'https://ydspdazwbansgdtjhvrp.supabase.co').trim();
  const rawKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || '').trim();

  if (!rawKey || !rawUrl.startsWith('http')) {
    return null;
  }

  try {
    return createClient<Database>(rawUrl, rawKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch {
    return null;
  }
}

export const supabaseAdmin = getSupabaseAdmin();
