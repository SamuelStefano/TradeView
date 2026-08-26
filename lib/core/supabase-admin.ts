import { createClient } from '@supabase/supabase-js';

import { DB_SCHEMA } from '../supabase/config';
import { supabaseSecretKey, supabaseUrl } from './env';

// Bypasses RLS. Only reach for this when a write genuinely cannot be expressed
// as the user — and authorize the user by hand before you do, because the
// database will not do it for you.
export function createAdminClient() {
  return createClient(supabaseUrl(), supabaseSecretKey(), {
    db: { schema: DB_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
