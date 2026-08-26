// Publishable credentials only. Both values are safe in the browser bundle:
// the URL is public and the publishable key is powerless without a session,
// because every table is default-deny under RLS.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// The project is shared with another app that owns `public`. Every table and
// function this app touches lives here, so no query can reach the other one.
export const DB_SCHEMA = 'tradeview';
