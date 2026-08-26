import 'server-only';

import { createSupabaseAdminClient } from './supabase/server';

// Signing in here is what makes someone a TradeView user. The auth tables are
// shared with another app in the same project, so provisioning is driven from
// this app instead of a trigger that would fire for its signups too.
export async function ensureUserSetup(userId: string, displayName: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc('ensure_user_setup', {
    p_user_id: userId,
    p_display_name: displayName,
  });

  if (error) throw new Error(`provisionamento falhou: ${error.message}`);
}
