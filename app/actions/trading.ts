'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUserId } from '@/lib/supabase/server';
import { placeOrder } from '@/lib/trading/place-order';
import { recordTransfer } from '@/lib/trading/transfer';
import type { Side, OrderType } from '@/lib/trading/paper-engine';

export interface ActionState {
  ok: boolean;
  message: string;
}

// Server Actions are POSTs to their own route, so a change to the proxy matcher
// can silently drop them from its coverage. Every action re-verifies the session
// itself instead of trusting that layer.
async function requireUser(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error('sessão expirada — entre novamente');
  return userId;
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  if (typeof value !== 'string') throw new Error(`campo obrigatório: ${name}`);
  return value.trim();
}

// The inputs accept the Brazilian decimal comma; Decimal only parses a dot.
function numericField(form: FormData, name: string): string {
  const raw = field(form, name).replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(raw)) throw new Error(`valor inválido em ${name}`);
  return raw;
}

function parseMode(raw: string): 'paper' | 'real' {
  if (raw !== 'paper' && raw !== 'real') throw new Error('modo inválido');
  return raw;
}

function failure(error: unknown): ActionState {
  return { ok: false, message: error instanceof Error ? error.message : 'erro inesperado' };
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

export async function placeOrderAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const userId = await requireUser();

    const side = field(form, 'side');
    if (side !== 'buy' && side !== 'sell') throw new Error('lado inválido');

    const type = field(form, 'type');
    if (type !== 'market' && type !== 'limit') throw new Error('tipo inválido');

    const limitPrice = form.get('limitPrice');
    if (type === 'limit' && (typeof limitPrice !== 'string' || !limitPrice.trim())) {
      throw new Error('ordem limitada exige preço');
    }

    const result = await placeOrder({
      userId,
      symbol: field(form, 'symbol'),
      side: side as Side,
      type: type as OrderType,
      qty: numericField(form, 'qty'),
      limitPrice: type === 'limit' ? numericField(form, 'limitPrice') : undefined,
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
