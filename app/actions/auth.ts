'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { createSupabaseServerClient } from '@/lib/supabase/server';

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

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Supabase already returns a generic message here; keep it generic so the form
  // cannot be used to tell which e-mails have accounts.
  if (error) return { ok: false, message: 'e-mail ou senha incorretos' };

  revalidatePath('/', 'layout');
  redirect('/trade');
}

export async function signUpAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  let email: string;
  let password: string;

  try {
    ({ email, password } = credentials(form));
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'dados inválidos' };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { ok: false, message: error.message };

  if (!data.session) {
    return { ok: true, message: 'conta criada — confirme o e-mail para entrar' };
  }

  revalidatePath('/', 'layout');
  redirect('/trade');
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
