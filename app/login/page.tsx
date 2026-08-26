import Link from 'next/link';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/auth/LoginForm';
import { supabaseConfigured } from '@/lib/supabase/config';
import { getSessionUserId } from '@/lib/supabase/server';

export const metadata = { title: 'Entrar · TradeView' };

export default async function LoginPage() {
  if (!supabaseConfigured) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-3 p-6">
        <h1 className="text-sm font-bold text-text m-0">Autenticação não configurada</h1>
        <p className="text-[11.5px] text-text-secondary text-center max-w-[420px] m-0">
          Este deploy roda em modo demonstração, com dados simulados e sem banco. Defina{' '}
          <code className="text-text">NEXT_PUBLIC_SUPABASE_URL</code> e{' '}
          <code className="text-text">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> para habilitar
          conta, saldo e ordens.
        </p>
        <Link href="/" className="text-xs">
          voltar ao terminal
        </Link>
      </main>
    );
  }

  if (await getSessionUserId()) redirect('/trade');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-5 p-6">
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-base font-bold text-text m-0">TradeView</h1>
        <p className="text-[11.5px] text-text-muted m-0">terminal multimercado com camada de IA</p>
      </div>

      <LoginForm />

      <p className="text-[11px] text-text-faint text-center max-w-[340px] m-0">
        Contas novas começam em modo paper, com saldo zero e trading real desligado.
      </p>
    </main>
  );
}
