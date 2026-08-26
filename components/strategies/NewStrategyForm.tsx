'use client';

import { useActionState, useState } from 'react';

import { createStrategyAction, type ActionState } from '@/app/actions/strategies';
import { TIMEFRAMES } from '@/lib/markets/timeframes';

type Kind = 'sma_cross' | 'rsi_reversion' | 'breakout';

const KINDS: { value: Kind; label: string; explains: string }[] = [
  {
    value: 'sma_cross',
    label: 'Cruzamento de médias',
    explains: 'Compra quando a média rápida cruza acima da lenta, vende no cruzamento oposto.',
  },
  {
    value: 'rsi_reversion',
    label: 'Reversão pelo RSI',
    explains: 'Compra abaixo do nível de sobrevenda, vende acima do de sobrecompra.',
  },
  {
    value: 'breakout',
    label: 'Rompimento',
    explains: 'Compra quando a vela fecha acima da máxima da janela, vende abaixo da mínima.',
  },
];

const initial: ActionState = { ok: false, message: '' };

const inputClass =
  'h-9 px-2.5 bg-base border border-border rounded-md text-text text-xs font-mono tabular-nums';

interface Props {
  symbols: string[];
}

function Number_({ name, label, value }: { name: string; label: string; value: number }) {
  return (
    <label className="flex flex-col gap-1 text-[11px] text-text-muted">
      {label}
      <input
        name={name}
        type="number"
        min={1}
        step={1}
        defaultValue={value}
        required
        className={`${inputClass} w-[110px]`}
      />
    </label>
  );
}

export function NewStrategyForm({ symbols }: Props) {
  const [state, submit, saving] = useActionState(createStrategyAction, initial);
  const [kind, setKind] = useState<Kind>('sma_cross');

  const chosen = KINDS.find((k) => k.value === kind)!;

  return (
    <form
      action={submit}
      className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3"
    >
      <h2 className="text-xs font-bold text-text m-0">NOVA ESTRATÉGIA</h2>

      <div className="flex gap-3 flex-wrap">
        <label className="flex flex-col gap-1 text-[11px] text-text-muted">
          Nome
          <input
            name="name"
            type="text"
            maxLength={60}
            required
            placeholder="cruzamento BTC"
            className={`${inputClass} w-[200px] font-sans`}
          />
        </label>

        <label className="flex flex-col gap-1 text-[11px] text-text-muted">
          Par
          <select name="symbol" required className={`${inputClass} w-[160px]`}>
            {symbols.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[11px] text-text-muted">
          Timeframe
          <select name="timeframe" defaultValue="1h" className={`${inputClass} w-[100px]`}>
            {TIMEFRAMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[11px] text-text-muted">
          Tamanho por entrada
          <input
            name="orderNotional"
            type="text"
            inputMode="decimal"
            pattern="[0-9]+([.,][0-9]+)?"
            defaultValue="250,00"
            required
            className={`${inputClass} w-[140px]`}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-[11px] text-text-muted">
        Tipo
        <select
          name="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as Kind)}
          className={`${inputClass} w-[240px] font-sans`}
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <span className="text-text-faint" style={{ fontSize: 10.5 }}>
          {chosen.explains}
        </span>
      </label>

      <div className="flex gap-3 flex-wrap">
        {kind === 'sma_cross' && (
          <>
            <Number_ name="fast" label="Média rápida" value={9} />
            <Number_ name="slow" label="Média lenta" value={21} />
          </>
        )}
        {kind === 'rsi_reversion' && (
          <>
            <Number_ name="period" label="Período" value={14} />
            <Number_ name="oversold" label="Sobrevenda" value={30} />
            <Number_ name="overbought" label="Sobrecompra" value={70} />
          </>
        )}
        {kind === 'breakout' && <Number_ name="lookback" label="Janela" value={20} />}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || symbols.length === 0}
          className="h-8 px-4 bg-accent-bg border border-accent-border rounded-md text-accent text-xs font-semibold cursor-pointer disabled:opacity-50"
        >
          {saving ? 'criando…' : 'Criar parada'}
        </button>
        <span className="text-text-faint" style={{ fontSize: 10.5 }}>
          Nasce parada. Nada opera por ter sido salvo.
        </span>
      </div>

      {state.message && (
        <p className={`m-0 text-[11.5px] ${state.ok ? 'text-up' : 'text-down'}`} role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}
