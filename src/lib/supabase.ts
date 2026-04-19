import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
const service = import.meta.env.SUPABASE_SERVICE_ROLE ?? '';

export const isSupabaseConfigured = Boolean(url && anon);

export function publicSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(url, anon, { auth: { persistSession: false } });
}

export function adminSupabase(): SupabaseClient | null {
  if (!url || !service) return null;
  return createClient(url, service, { auth: { persistSession: false } });
}
