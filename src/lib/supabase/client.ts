import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { publicEnv } from '../../config/publicEnv';

/**
 * Browser-side Supabase client using public environment variables from .env.local
 */
export function createBrowserClient() {
  const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key } = publicEnv;

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
