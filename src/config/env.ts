import { z } from 'zod';

function resolveSupabaseUrl(): string {
  const candidates = [
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ];
  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim().startsWith('http')) {
      return c.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    }
  }
  return '';
}

function resolveSecretKey(): string {
  const candidates = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ];
  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim().length > 10) {
      return c.trim();
    }
  }
  return '';
}

export const env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  SUPABASE_URL: resolveSupabaseUrl(),
  SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '',
  SUPABASE_SERVICE_ROLE_KEY: resolveSecretKey(),
};
