import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { env } from '../../config/env';

export function createServerClient() {
  const url = (env.SUPABASE_URL || 'https://ydspdazwbansgdtjhvrp.supabase.co').trim();
  const key = (env.SUPABASE_ANON_KEY || '').trim();

  if (!key || !url.startsWith('http')) return null;

  try {
    return createClient<Database>(url, key, {
      auth: {
        persistSession: false,
      },
    });
  } catch {
    return null;
  }
}
