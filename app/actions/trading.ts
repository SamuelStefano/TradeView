'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUserId } from '@/lib/supabase/server';
import { placeOrder, quoteOrder } from '@/lib/trading/place-order';
import { recordTransfer } from '@/lib/trading/transfer';
import { setKillSwitch } from '@/lib/trading/kill-switch';
import type { Side, OrderType } from '@/lib/trading/paper-engine';
import { TradingError } from '@/lib/trading/errors';
import { checkRate } from '@/lib/rate-limit';

export interface ActionState {
  ok: boolean;
  message: string;
}

// Server Actions are POSTs to their own route, so a change to the proxy matcher
// can silently drop them from its coverage. Every action re-verifies the session
// itself instead of trusting that layer.
async function requireUser(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) throw new TradingError('sessão expirada — entre novamente');
  checkRate(userId);
  return userId;
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  if (typeof value !== 'string') throw new TradingError(`campo obrigatório: ${name}`);
  return value.trim();
}

// The inputs accept the Brazilian decimal comma; Decimal only parses a dot.
function numericField(form: FormData, name: string): string {
  const raw = field(form, name).replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(raw)) throw new TradingError(`valor inválido em ${name}`);
  return raw;
}

function parseMode(raw: string): 'paper' | 'real' {
  if (raw !== 'paper' && raw !== 'real') throw new TradingError('modo inválido');
  return raw;
}

// Only messages we wrote ourselves reach the browser. Everything else is logged
// server-side and replaced, so a stack or a query fragment never renders.
function failure(error: unknown): ActionState {
  if (error instanceof TradingError) return { ok: false, message: error.message };

  console.error('[trading action]', error);
  return { ok: false, message: 'erro inesperado — tente novamente' };
}

export async function depositAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const userId = await requireUser();
    await recordTransfer({
      userId,
      kind: 'deposit',
      amount: numericField(form, 'amount'),
      currency: field(form, 'currency'),
      mode: parseMode(field(form, 'mode')),
    });

    revalidatePath('/portfolio');
    revalidatePath('/');
    return { ok: true, message: 'depósito confirmado' };
  } catch (error) {
    return failure(error);
  }
}

export async function withdrawAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const userId = await requireUser();
    await recordTransfer({
      userId,
      kind: 'withdrawal',
      amount: numericField(form, 'amount'),
      currency: field(form, 'currency'),
      mode: parseMode(field(form, 'mode')),
    });

    revalidatePath('/portfolio');
    revalidatePath('/');
    return { ok: true, message: 'saque confirmado' };
  } catch (error) {
    return failure(error);
  }
}

export async function previewOrderAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    await requireUser();

    const { side, type, limitPrice } = orderFields(form);

    const quote = await quoteOrder({
      symbol: field(form, 'symbol'),
      side,
      type,
      qty: numericField(form, 'qty'),
      limitPrice,
    });

    const partial = quote.partial ? ' (parcial — book raso)' : '';
    return {
      ok: true,
      message:
        `${quote.filledQty} ${quote.baseCurrency} @ ${quote.avgPrice} = ` +
        `${quote.notional} ${quote.quoteCurrency} · taxa ${quote.fee} · ` +
        `slippage ${quote.slippagePct}%${partial}`,
    };
  } catch (error) {
    return failure(error);
  }
}

function orderFields(form: FormData): {
  side: Side;
  type: OrderType;
  limitPrice: string | undefined;
} {
  const side = field(form, 'side');
  if (side !== 'buy' && side !== 'sell') throw new TradingError('lado inválido');

  const type = field(form, 'type');
  if (type !== 'market' && type !== 'limit') throw new TradingError('tipo inválido');

  return {
    side,
    type,
    limitPrice: type === 'limit' ? numericField(form, 'limitPrice') : undefined,
  };
}

export async function placeOrderAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const userId = await requireUser();

    const { side, type, limitPrice } = orderFields(form);

    const result = await placeOrder({
      userId,
      symbol: field(form, 'symbol'),
      side,
      type,
      qty: numericField(form, 'qty'),
      limitPrice,
      mode: parseMode(field(form, 'mode')),
    });

    revalidatePath('/portfolio');
    revalidatePath('/');

    const label = result.partial ? 'parcialmente executada' : 'executada';
    return {
      ok: true,
      message: `ordem ${label}: ${result.filledQty} @ ${result.avgPrice} · slippage ${result.slippagePct}%`,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function setKillSwitchAction(active: boolean): Promise<ActionState> {
  try {
    const userId = await requireUser();
    await setKillSwitch(userId, active);

    revalidatePath('/', 'layout');

    return {
      ok: true,
      message: active
        ? 'kill switch ativo — ordens e transferências bloqueadas'
        : 'kill switch desligado',
    };
  } catch (error) {
    return failure(error);
  }
}
