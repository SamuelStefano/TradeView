'use client';

import { useActionState, useState } from 'react';
import { signInAction, signUpAction, type AuthState } from '@/app/actions/auth';

const initial: AuthState = { ok: false, message: '' };

export function LoginForm() {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const action = mode === 'in' ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col gap-3 w-full max-w-[340px]">
      <div className="flex gap-1" role="tablist" aria-label="Entrar ou criar conta">
        {(['in', 'up'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`h-8 px-3 rounded-md text-xs cursor-pointer border ${
              mode === m
                ? 'bg-hover border-border-strong text-text'
                : 'bg-transparent border-border text-text-muted hover:text-text'
            }`}
          >
            {m === 'in' ? 'Entrar' : 'Criar conta'}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1 text-[11px] text-text-muted">
        e-mail
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-9 px-2.5 bg-base border border-border rounded-md text-text text-xs"
        />
      </label>

      <label className="flex flex-col gap-1 text-[11px] text-text-muted">
        senha (mínimo 12 caracteres)
        <input
          name="password"
          type="password"
          autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          minLength={12}
          required
          className="h-9 px-2.5 bg-base border border-border rounded-md text-text text-xs"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="h-9 bg-accent-bg border border-accent-border rounded-md text-accent text-xs font-semibold cursor-pointer disabled:opacity-50"
      >
        {pending ? 'aguarde…' : mode === 'in' ? 'Entrar' : 'Criar conta'}
      </button>

      {state.message && (
        <p
          role="status"
          className={`text-[11.5px] m-0 ${state.ok ? 'text-up' : 'text-down'}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
