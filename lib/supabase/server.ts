import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, DB_SCHEMA } from './config';
import { supabaseSecretKey } from '../env';

// Session-scoped client. Every query it makes is filtered by RLS, so this is
// what reads user data.
export async function createSupabaseServerClient() {
  const store = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    db: { schema: DB_SCHEMA },
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            store.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies once streaming has begun.
          // Refresh is handled in proxy.ts, so dropping the write is safe here.
        }
      },
    },
  });
}

// Bypasses RLS. Only reach for this when a write genuinely cannot be expressed
// as the user — and authorize the user by hand before you do, because the
// database will not do it for you.
export function createSupabaseAdminClient() {
  return createClient(SUPABASE_URL, supabaseSecretKey(), {
    db: { schema: DB_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getSessionUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  // getClaims verifies the JWT signature; getSession would trust the cookie.
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return data.claims.sub;
}
