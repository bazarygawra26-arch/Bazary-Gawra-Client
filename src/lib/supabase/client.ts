import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { env } from '../../config/env';

export function createBrowserClient() {
  const url = (env.SUPABASE_URL || 'https://ydspdazwbansgdtjhvrp.supabase.co').trim();
  const key = (env.SUPABASE_ANON_KEY || '').trim();

  if (!key || !url.startsWith('http')) return null;

  try {
    return createClient<Database>(url, key);
  } catch {
    return null;
  }
}

export const supabaseBrowserClient = createBrowserClient();
