'use client';

import { useActionState } from 'react';

import { updateRiskSettingsAction, type ActionState } from '@/app/actions/trading';

const initial: ActionState = { ok: false, message: '' };

interface Props {
  maxOrderNotional: string;
  realTradingEnabled: boolean;
  realTradingAllowedHere: boolean;
}

export function RiskLimitsForm({
  maxOrderNotional,
  realTradingEnabled,
  realTradingAllowedHere,
}: Props) {
  const [state, submit, saving] = useActionState(updateRiskSettingsAction, initial);

  return (
    <form
      action={submit}
      className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3"
    >
      <h2 className="text-xs font-bold text-text m-0">LIMITES DE RISCO</h2>

      <label className="flex flex-col gap-1 text-[11px] text-text-muted">
        Tamanho máximo por ordem
        <input
          name="maxOrderNotional"
          type="text"
          inputMode="decimal"
          pattern="[0-9]+([.,][0-9]+)?"
          defaultValue={Number(maxOrderNotional).toFixed(2).replace('.', ',')}
          required
          className="h-9 px-2.5 bg-base border border-border rounded-md text-text text-xs font-mono tabular-nums w-[220px]"
        />
        <span className="text-text-faint" style={{ fontSize: 10.5 }}>
          Na moeda de cotação do par. Toda ordem acima disso é recusada antes de tocar o book.
        </span>
      </label>

      <label className="flex items-start gap-2 text-[11.5px] text-text-secondary">
        <input
          name="realTradingEnabled"
          type="checkbox"
          defaultChecked={realTradingEnabled}
          className="mt-0.5"
        />
        <span>
          Permitir trading real nesta conta
          <span className="block text-text-faint" style={{ fontSize: 10.5 }}>
            {realTradingAllowedHere
              ? 'O ambiente permite. Marcar aqui é o segundo dos dois gates.'
              : 'Este ambiente bloqueia trading real por variável de deploy, então marcar aqui não libera nada sozinho.'}
          </span>
        </span>
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-8 px-4 bg-accent-bg border border-accent-border rounded-md text-accent text-xs font-semibold cursor-pointer disabled:opacity-50"
        >
          {saving ? 'salvando…' : 'Salvar limites'}
        </button>
        {state.message && (
          <span
            role="status"
            className={`text-[11.5px] ${state.ok ? 'text-up' : 'text-down'}`}
          >
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
