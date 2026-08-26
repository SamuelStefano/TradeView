import 'server-only';

import { createSupabaseAdminClient } from '../supabase/server';
import { money } from '../money';

export type TransferKind = 'deposit' | 'withdrawal';

export interface TransferInput {
  userId: string;
  kind: TransferKind;
  amount: string;
  currency: string;
  mode: 'paper' | 'real';
}

// Paper money is fictional, but an unbounded deposit would make every risk
// number meaningless, so the same ceiling applies to both modes.
const MAX_TRANSFER = money('1000000');

export async function recordTransfer(input: TransferInput): Promise<string> {
  const amount = money(input.amount);

  if (!amount.isFinite() || amount.lte(0)) throw new Error('valor deve ser positivo');
  if (amount.gt(MAX_TRANSFER)) throw new Error('valor acima do limite de 1.000.000 por operação');

  const supabase = createSupabaseAdminClient();

  const { data: settings, error: settingsError } = await supabase
    .from('trading_settings')
    .select('kill_switch_active')
    .eq('user_id', input.userId)
    .single();

  if (settingsError || !settings) throw new Error('configuração de risco não encontrada');
  if (settings.kill_switch_active) throw new Error('kill switch ativo — transferências bloqueadas');

  const { data, error } = await supabase.rpc('record_transfer', {
    p_user_id: input.userId,
    p_kind: input.kind,
    p_amount: amount.toFixed(18),
    p_currency: input.currency,
    p_method: 'simulado',
    p_provider_ref: null,
    p_account_kind: input.mode,
  });

  if (error) throw new Error(error.message);
  return data as string;
}
