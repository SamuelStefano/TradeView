import 'server-only';

import { createSupabaseAdminClient } from '../supabase/server';
import { TradingError } from './errors';

export async function readKillSwitch(userId: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('trading_settings')
    .select('kill_switch_active')
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new TradingError('configuração de risco não encontrada');
  return data.kill_switch_active;
}

// Writes the flag that place-order and transfer already check, so flipping it
// here actually stops trading rather than only changing what the screen says.
export async function setKillSwitch(userId: string, active: boolean): Promise<void> {
  const supabase = createSupabaseAdminClient();

  // An update that matches no row is not an error in PostgREST, so without
  // reading the row back an unprovisioned account would be told the block was
  // applied while nothing was written.
  const { data, error } = await supabase
    .from('trading_settings')
    .update({ kill_switch_active: active, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select('user_id');

  if (error) throw new TradingError('não foi possível gravar o kill switch');
  if (!data || data.length === 0) throw new TradingError('configuração de risco não encontrada');
}
