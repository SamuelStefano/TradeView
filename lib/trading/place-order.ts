import 'server-only';

import { createSupabaseAdminClient } from '../supabase/server';
import { fetchOrderBook } from '../markets/exchange';
import { realTradingAllowed } from '../env';
import { money, toDbString } from '../money';
import { simulateFill, cashEffect, type Side, type OrderType } from './paper-engine';

export interface PlaceOrderInput {
  userId: string;
  symbol: string;
  side: Side;
  type: OrderType;
  qty: string;
  limitPrice?: string;
  mode: 'paper' | 'real';
  clientRef?: string;
}

export interface PlaceOrderResult {
  orderId: string;
  filledQty: string;
  avgPrice: string;
  fee: string;
  slippagePct: string;
  partial: boolean;
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const supabase = createSupabaseAdminClient();

  // The secret key bypasses RLS, so every read below is scoped by user_id by
  // hand. Nothing here may rely on the database to do the filtering.
  const { data: settings, error: settingsError } = await supabase
    .from('trading_settings')
    .select('real_trading_enabled, kill_switch_active, max_order_notional')
    .eq('user_id', input.userId)
    .single();

  if (settingsError || !settings) throw new Error('configuração de risco não encontrada');
  if (settings.kill_switch_active) throw new Error('kill switch ativo — ordens bloqueadas');

  if (input.mode === 'real') {
    // Two independent gates: a deploy-time env var and a per-user flag. Either
    // one off keeps real capital out of reach.
    if (!realTradingAllowed()) throw new Error('trading real desabilitado neste ambiente');
    if (!settings.real_trading_enabled) throw new Error('trading real desabilitado na sua conta');
  }

  const { data: instrument, error: instrumentError } = await supabase
    .from('instruments')
    .select('symbol, venue, base, quote, active')
    .eq('symbol', input.symbol)
    .single();

  if (instrumentError || !instrument) throw new Error(`instrumento desconhecido: ${input.symbol}`);
  if (!instrument.active) throw new Error(`instrumento inativo: ${input.symbol}`);

  const book = await fetchOrderBook(instrument.venue, instrument.symbol);

  const fill = simulateFill({
    book,
    side: input.side,
    type: input.type,
    qty: input.qty,
    limitPrice: input.limitPrice,
  });

  if (fill.filledQty.lte(0)) throw new Error('sem liquidez no preço pedido');

  if (fill.notional.gt(money(settings.max_order_notional))) {
    throw new Error(
      `ordem de ${fill.notional.toFixed(2)} excede o limite de ${settings.max_order_notional}`,
    );
  }

  const effect = cashEffect(input.side, fill);

  const { data: orderId, error } = await supabase.rpc('record_fill', {
    p_user_id: input.userId,
    p_symbol: instrument.symbol,
    p_side: input.side,
    p_type: input.type,
    p_mode: input.mode,
    p_requested_qty: input.qty,
    p_limit_price: input.limitPrice ?? null,
    p_fill_qty: toDbString(fill.filledQty),
    p_fill_price: toDbString(fill.avgPrice),
    p_fee: toDbString(fill.fee),
    p_quote_delta: toDbString(effect.quoteDelta),
    p_base_delta: toDbString(effect.baseDelta),
    p_base_currency: instrument.base,
    p_quote_currency: instrument.quote,
    p_client_ref: input.clientRef ?? null,
  });

  if (error) throw new Error(error.message);

  return {
    orderId: orderId as string,
    filledQty: fill.filledQty.toString(),
    avgPrice: fill.avgPrice.toFixed(2),
    fee: fill.fee.toFixed(8),
    slippagePct: fill.slippage.times(100).toFixed(3),
    partial: fill.partial,
  };
}
