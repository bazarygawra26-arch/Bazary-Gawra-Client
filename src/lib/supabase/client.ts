import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { env } from '../../config/env';

/**
 * Browser-side Supabase client using public environment variables from .env.local
 */
export function createBrowserClient() {
  const url = (env.SUPABASE_URL || '').trim();
  const key = (env.SUPABASE_ANON_KEY || '').trim();

  if (!url || !key || !url.startsWith('http')) {
    return null;
  }

  try {
    return createClient<Database>(url, key);
  } catch (err) {
    console.error('Failed to initialize browser Supabase client:', err);
    return null;
  }
}

export const supabaseBrowserClient = createBrowserClient();
