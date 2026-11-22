'use client';

import { supabaseBrowserClient } from './client';

export async function getSupabaseAuthHeaders(): Promise<Record<string, string>> {
  if (!supabaseBrowserClient) return {};

  const { data, error } = await supabaseBrowserClient.auth.getSession();
  if (error) throw error;

  return data.session
    ? { Authorization: `Bearer ${data.session.access_token}` }
    : {};
}
