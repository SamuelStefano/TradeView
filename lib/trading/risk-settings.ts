import 'server-only';

import { createSupabaseAdminClient } from '../supabase/server';
import { money } from '../money';
import { TradingError } from './errors';

export interface RiskSettings {
  realTradingEnabled: boolean;
  killSwitchActive: boolean;
  maxOrderNotional: string;
}

export async function readRiskSettings(userId: string): Promise<RiskSettings> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('trading_settings')
    .select('real_trading_enabled, kill_switch_active, max_order_notional')
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new TradingError('configuração de risco não encontrada');

  return {
    realTradingEnabled: data.real_trading_enabled,
    killSwitchActive: data.kill_switch_active,
    maxOrderNotional: data.max_order_notional,
  };
}

const MAX_NOTIONAL_CEILING = money('10000000');

export async function updateRiskSettings(
  userId: string,
  input: { maxOrderNotional: string; realTradingEnabled: boolean },
): Promise<void> {
  const notional = money(input.maxOrderNotional);
  if (notional.lte(0)) throw new TradingError('o limite por ordem precisa ser maior que zero');
  if (notional.gt(MAX_NOTIONAL_CEILING)) {
    throw new TradingError('limite por ordem alto demais');
  }

  const supabase = createSupabaseAdminClient();

  // An update matching no row is not an error in PostgREST, so the row is read
  // back — otherwise an unprovisioned account is told the limit was saved while
  // nothing was written.
  const { data, error } = await supabase
    .from('trading_settings')
    .update({
      max_order_notional: notional.toFixed(18),
      real_trading_enabled: input.realTradingEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('user_id');

  if (error) throw new TradingError('não foi possível gravar os limites');
  if (!data || data.length === 0) throw new TradingError('configuração de risco não encontrada');
}
