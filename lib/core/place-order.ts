import { createAdminClient } from './supabase-admin';
import { loadInstrument } from './instruments';
import { fetchOrderBook } from './exchange';
import { realTradingAllowed } from './env';
import { money, toDbString } from '../money';
import { TradingError, fromDatabase } from '../trading/errors';
import { simulateFill, cashEffect, type Side, type OrderType } from '../trading/paper-engine';

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

export interface QuotePreview {
  filledQty: string;
  avgPrice: string;
  notional: string;
  fee: string;
  slippagePct: string;
  partial: boolean;
  quoteCurrency: string;
  baseCurrency: string;
}

// Same engine and same book as the real thing, minus the write. The number the
// ticket previews can only move because the book moved, never because the
// preview used different maths.
export async function quoteOrder(
  input: Pick<PlaceOrderInput, 'symbol' | 'side' | 'type' | 'qty' | 'limitPrice'>,
): Promise<QuotePreview> {
  const instrument = await loadInstrument(input.symbol);
  const book = await fetchOrderBook(instrument.venue, instrument.symbol);

  const fill = simulateFill({
    book,
    side: input.side,
    type: input.type,
    qty: input.qty,
    limitPrice: input.limitPrice,
  });

  if (fill.filledQty.lte(0)) throw new TradingError('sem liquidez no preço pedido');

  return {
    filledQty: fill.filledQty.toString(),
    avgPrice: fill.avgPrice.toFixed(2),
    notional: fill.notional.toFixed(2),
    fee: fill.fee.toFixed(8),
    slippagePct: fill.slippage.times(100).toFixed(3),
    partial: fill.partial,
    quoteCurrency: instrument.quote,
    baseCurrency: instrument.base,
  };
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const supabase = createAdminClient();

  // The secret key bypasses RLS, so every read below is scoped by user_id by
  // hand. Nothing here may rely on the database to do the filtering.
  const { data: settings, error: settingsError } = await supabase
    .from('trading_settings')
    .select('real_trading_enabled, kill_switch_active, max_order_notional')
    .eq('user_id', input.userId)
    .single();

  if (settingsError || !settings) throw new TradingError('configuração de risco não encontrada');
  if (settings.kill_switch_active) throw new TradingError('kill switch ativo — ordens bloqueadas');

  if (input.mode === 'real') {
    // Two independent gates: a deploy-time env var and a per-user flag. Either
    // one off keeps real capital out of reach.
    if (!realTradingAllowed()) throw new TradingError('trading real desabilitado neste ambiente');
    if (!settings.real_trading_enabled) throw new TradingError('trading real desabilitado na sua conta');

    // Não existe roteamento para a venue: o preenchimento abaixo é simulado
    // contra o book. Passar por aqui gravaria no razão uma execução que nunca
    // aconteceu, e a diferença só apareceria na corretora. Recusar é a única
    // resposta honesta enquanto a ordem não sai daqui.
    throw new TradingError('execução real ainda não existe — a ordem não sairia para a corretora');
  }

  const instrument = await loadInstrument(input.symbol);

  const book = await fetchOrderBook(instrument.venue, instrument.symbol);

  const fill = simulateFill({
    book,
    side: input.side,
    type: input.type,
    qty: input.qty,
    limitPrice: input.limitPrice,
  });

  if (fill.filledQty.lte(0)) throw new TradingError('sem liquidez no preço pedido');

  if (fill.notional.gt(money(settings.max_order_notional))) {
    throw new TradingError(
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

  if (error) throw fromDatabase(error, 'record_fill');

  return {
    orderId: orderId as string,
    filledQty: fill.filledQty.toString(),
    avgPrice: fill.avgPrice.toFixed(2),
    fee: fill.fee.toFixed(8),
    slippagePct: fill.slippage.times(100).toFixed(3),
    partial: fill.partial,
  };
}
