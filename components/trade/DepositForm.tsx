'use client';

import { useActionState } from 'react';
import { depositAction, withdrawAction, type ActionState } from '@/app/actions/trading';

const initial: ActionState = { ok: false, message: '' };

interface Props {
  currencies: string[];
  mode: 'paper' | 'real';
}

export function DepositForm({ currencies, mode }: Props) {
  const [depositState, deposit, depositing] = useActionState(depositAction, initial);
  const [withdrawState, withdraw, withdrawing] = useActionState(withdrawAction, initial);

  const state = depositState.message ? depositState : withdrawState;
  const busy = depositing || withdrawing;

  return (
    <form className="flex flex-col gap-2.5">
      <input type="hidden" name="mode" value={mode} />

      <div className="flex gap-2">
        <label className="flex flex-col gap-1 text-[11px] text-text-muted flex-1">
          valor
          <input
            name="amount"
            type="text"
            inputMode="decimal"
            pattern="[0-9]+([.,][0-9]+)?"
            placeholder="1000"
            required
            className="h-9 px-2.5 bg-base border border-border rounded-md text-text text-xs font-mono tabular-nums"
          />
        </label>

        <label className="flex flex-col gap-1 text-[11px] text-text-muted w-[110px]">
          moeda
          <select
            name="currency"
            defaultValue={currencies[0]}
            className="h-9 px-2 bg-base border border-border rounded-md text-text text-xs"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-2">
        <button
          formAction={deposit}
          disabled={busy}
          className="h-9 flex-1 bg-up-bg border border-up-border rounded-md text-up text-xs font-semibold cursor-pointer disabled:opacity-50"
        >
          {depositing ? 'creditando…' : 'Depositar'}
        </button>
        <button
          formAction={withdraw}
          disabled={busy}
          className="h-9 flex-1 bg-hover border border-border-strong rounded-md text-text-secondary text-xs cursor-pointer hover:text-text disabled:opacity-50"
        >
          {withdrawing ? 'sacando…' : 'Sacar'}
        </button>
      </div>

      {state.message && (
        <p role="status" className={`text-[11.5px] m-0 ${state.ok ? 'text-up' : 'text-down'}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
