import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, DB_SCHEMA } from './config';
import { createAdminClient } from '../core/supabase-admin';

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

export { createAdminClient as createSupabaseAdminClient };

export async function getSessionUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  // getClaims verifies the JWT signature; getSession would trust the cookie.
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return data.claims.sub;
}
