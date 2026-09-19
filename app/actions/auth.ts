'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { safeNextPath } from '@/lib/auth/next-path';
import { accessAllowed } from '@/lib/auth/allowlist';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ensureUserSetup } from '@/lib/provision';
import { checkRate } from '@/lib/rate-limit';
import { TradingError } from '@/lib/trading/errors';

export interface AuthState {
  ok: boolean;
  message: string;
}

function credentials(form: FormData): { email: string; password: string } {
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');

  if (!email.includes('@')) throw new Error('e-mail inválido');
  if (password.length < 12) throw new Error('a senha precisa de ao menos 12 caracteres');

  return { email, password };
}

export async function signInAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  let email: string;
  let password: string;

  try {
    ({ email, password } = credentials(form));
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'dados inválidos' };
  }

  // The only unauthenticated write path in the app, so it is the one that has to
  // carry the limiter. Keyed on the address rather than on nothing, so a spray
  // across many passwords for one account runs out first.
  try {
    checkRate(`signin:${email.toLowerCase()}`);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof TradingError ? error.message : 'muitas tentativas — aguarde',
    };
  }

  // auth.users belongs to the whole project, so every account of the app that
  // shares it already holds credentials that authenticate here. Gating only the
  // signup form left the login form open to all of them, and ensureUserSetup
  // below would then hand each one a TradeView wallet. Same generic message, so
  // the form still does not say who is on the list.
  if (!accessAllowed(email)) return { ok: false, message: 'e-mail ou senha incorretos' };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  // Supabase already returns a generic message here; keep it generic so the form
  // cannot be used to tell which e-mails have accounts.
  if (error || !data.user) return { ok: false, message: 'e-mail ou senha incorretos' };

  await ensureUserSetup(data.user.id, email.split('@')[0]);

  revalidatePath('/', 'layout');
  redirect(safeNextPath(String(form.get('next') ?? '')));
}

export async function signUpAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  let email: string;
  let password: string;

  try {
    ({ email, password } = credentials(form));
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'dados inválidos' };
  }

  try {
    checkRate(`signup:${email.toLowerCase()}`);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof TradingError ? error.message : 'muitas tentativas — aguarde',
    };
  }

  if (!accessAllowed(email)) {
    return { ok: false, message: 'cadastro fechado — este terminal é de uso pessoal' };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { ok: false, message: error.message };

  if (!data.session || !data.user) {
    return { ok: true, message: 'conta criada — confirme o e-mail para entrar' };
  }

  await ensureUserSetup(data.user.id, email.split('@')[0]);

  revalidatePath('/', 'layout');
  redirect(safeNextPath(String(form.get('next') ?? '')));
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
