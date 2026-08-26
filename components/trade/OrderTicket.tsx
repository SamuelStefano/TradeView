'use client';

import { useActionState, useState } from 'react';
import { placeOrderAction, type ActionState } from '@/app/actions/trading';

const initial: ActionState = { ok: false, message: '' };

export interface TradableInstrument {
  symbol: string;
  venue: string;
  base: string;
  quote: string;
}

interface Props {
  instruments: TradableInstrument[];
  mode: 'paper' | 'real';
  realEnabled: boolean;
}

export function OrderTicket({ instruments, mode, realEnabled }: Props) {
  const [state, formAction, pending] = useActionState(placeOrderAction, initial);
  const [symbol, setSymbol] = useState(instruments[0]?.symbol ?? '');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [type, setType] = useState<'market' | 'limit'>('market');

  const instrument = instruments.find((i) => i.symbol === symbol);
  const blocked = mode === 'real' && !realEnabled;

  if (instruments.length === 0) {
    return (
      <p className="text-[11.5px] text-text-muted m-0">
        Nenhum instrumento ativo cadastrado. Rode as migrations do banco.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2.5">
      <input type="hidden" name="mode" value={mode} />

      <label className="flex flex-col gap-1 text-[11px] text-text-muted">
        instrumento
        <select
          name="symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="h-9 px-2 bg-base border border-border rounded-md text-text text-xs"
        >
          {instruments.map((i) => (
            <option key={i.symbol} value={i.symbol}>
              {i.symbol} · {i.venue}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-2">
        <fieldset className="flex-1 border-0 p-0 m-0 flex flex-col gap-1">
          <legend className="text-[11px] text-text-muted p-0">lado</legend>
          <div className="flex gap-1">
            {(['buy', 'sell'] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={side === s}
                onClick={() => setSide(s)}
                className={`h-8 flex-1 rounded-md text-xs cursor-pointer border ${
                  side === s
                    ? s === 'buy'
                      ? 'bg-up-bg border-up-border text-up'
                      : 'bg-down-bg border-danger-border text-down'
                    : 'bg-transparent border-border text-text-muted hover:text-text'
                }`}
              >
                {s === 'buy' ? 'Comprar' : 'Vender'}
              </button>
            ))}
          </div>
          <input type="hidden" name="side" value={side} />
        </fieldset>

        <label className="flex flex-col gap-1 text-[11px] text-text-muted w-[110px]">
          tipo
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as 'market' | 'limit')}
            className="h-8 px-2 bg-base border border-border rounded-md text-text text-xs"
          >
            <option value="market">mercado</option>
            <option value="limit">limitada</option>
          </select>
        </label>
      </div>

      <div className="flex gap-2">
        <label className="flex flex-col gap-1 text-[11px] text-text-muted flex-1">
          quantidade {instrument && <span className="text-text-faint">({instrument.base})</span>}
          <input
            name="qty"
            type="text"
            inputMode="decimal"
            pattern="[0-9]+([.,][0-9]+)?"
            placeholder="0,01"
            required
            className="h-9 px-2.5 bg-base border border-border rounded-md text-text text-xs font-mono tabular-nums"
          />
        </label>

        {type === 'limit' && (
          <label className="flex flex-col gap-1 text-[11px] text-text-muted flex-1">
            preço {instrument && <span className="text-text-faint">({instrument.quote})</span>}
            <input
              name="limitPrice"
              type="text"
              inputMode="decimal"
              pattern="[0-9]+([.,][0-9]+)?"
              required
              className="h-9 px-2.5 bg-base border border-border rounded-md text-text text-xs font-mono tabular-nums"
            />
          </label>
        )}
      </div>

      <button
        type="submit"
        disabled={pending || blocked}
        className="h-9 bg-accent-bg border border-accent-border rounded-md text-accent text-xs font-semibold cursor-pointer disabled:opacity-50"
      >
        {pending ? 'executando…' : blocked ? 'trading real desligado' : 'Enviar ordem'}
      </button>

      <p className="text-[11px] text-text-faint m-0 leading-[1.5]">
        A execução simulada percorre o book real da venue: preencher o topo do livro e subir
        de nível conforme a quantidade, com taxa taker e slippage cobrados.
      </p>

      {state.message && (
        <p role="status" className={`text-[11.5px] m-0 ${state.ok ? 'text-up' : 'text-down'}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
