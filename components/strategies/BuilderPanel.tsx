'use client';

import { useState } from 'react';
import { Bar } from '@/components/ui/Bar';

interface BuilderPanelProps {
  onActivateReal: () => void;
  onRunBacktest: () => void;
  running: boolean;
}

interface EntryCondition {
  a: string;
  op: string;
  b: string;
}

const INITIAL_ENTRIES: EntryCondition[] = [
  { a: 'funding_8h', op: '<', b: '−0,010%' },
  { a: 'open_interest_Δ48h', op: '>', b: '+5%' },
  { a: 'preço', op: '≥', b: 'MA(21) no 4h' },
  { a: 'convicção_IA', op: '≥', b: '40' },
];

const CANDIDATES: EntryCondition[] = [
  { a: 'volume_24h', op: '>', b: 'média(20d) × 1,5' },
  { a: 'basis_anual', op: '>', b: '+8%' },
  { a: 'rsi_4h', op: '<', b: '68' },
  { a: 'spread_efetivo', op: '<', b: '4 bps' },
  { a: 'liquidez_book_1%', op: '≥', b: 'US$ 250k' },
];

function aiWeightNote(weight: number): string {
  if (weight === 0) return 'Com 0%, a IA não participa da decisão — a estratégia é puramente sistemática.';
  if (weight < 50) return `Com ${weight}%, a IA pode vetar entradas (convicção < 40) mas não pode abrir posição sozinha.`;
  if (weight < 80) return `Com ${weight}%, a IA veta entradas e pode ajustar o sizing, mas a entrada ainda exige o sinal sistemático.`;
  return `Com ${weight}%, a IA abre posição sozinha. Exige track record calibrado antes de ir a real.`;
}

export function BuilderPanel({ onActivateReal, onRunBacktest, running }: BuilderPanelProps) {
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [aiWeight, setAiWeight] = useState(35);

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function addEntry() {
    setEntries((prev) => {
      const next = CANDIDATES.find((c) => !prev.some((e) => e.a === c.a));
      return next ? [...prev, next] : prev;
    });
  }

  const allUsed = CANDIDATES.every((c) => entries.some((e) => e.a === c.a));

  return (
    <section
      id="builder"
      tabIndex={-1}
      aria-label="Builder"
      className="bg-surface border border-border rounded-lg p-3.5 flex flex-col gap-3 outline-none"
    >
      <div
        className="text-[11px] text-text-muted uppercase tracking-[0.6px]"
      >
        Builder — Funding Squeeze v2
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-[10.5px] text-text-faint">ENTRADA — todas as condições</div>
        {entries.map((e, i) => (
          <div
            key={e.a}
            className="flex items-center gap-2 bg-inset border border-border rounded-md px-2.5 py-[7px] font-mono text-[11px]"
          >
            <span className="text-accent-hover">{e.a}</span>
            <span className="text-text-faint">{e.op}</span>
            <span className="text-text">{e.b}</span>
            <button
              onClick={() => removeEntry(i)}
              aria-label={`Remover condição ${e.a}`}
              className="ml-auto bg-transparent border-none text-text-faint cursor-pointer text-[11px] hover:text-text-muted"
            >
              ✕
            </button>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-[10.5px] text-text-faint italic">
            Sem condições de entrada — a estratégia não dispara.
          </div>
        )}
        <button
          onClick={addEntry}
          disabled={allUsed}
          aria-label="Adicionar condição de entrada"
          className="h-[26px] border border-dashed border-border-strong rounded-md bg-transparent text-text-faint text-[11px] cursor-pointer hover:text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {allUsed ? 'sem condições disponíveis' : '+ condição'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-[10.5px] text-text-faint">
          Sizing
          <div className="mt-[3px] bg-inset border border-border rounded-md px-2.5 py-[7px] font-mono text-[11.5px] text-text">
            2% do capital / trade
          </div>
        </label>
        <label className="text-[10.5px] text-text-faint">
          Stop loss
          <div className="mt-[3px] bg-inset border border-border rounded-md px-2.5 py-[7px] font-mono text-[11.5px] text-text">
            −2,5% ou ATR×1,8
          </div>
        </label>
        <label className="text-[10.5px] text-text-faint">
          Take profit
          <div className="mt-[3px] bg-inset border border-border rounded-md px-2.5 py-[7px] font-mono text-[11.5px] text-text">
            +6% ou trailing 2%
          </div>
        </label>
        <label className="text-[10.5px] text-text-faint">
          Mercados
          <div className="mt-[3px] bg-inset border border-border rounded-md px-2.5 py-[7px] text-[11.5px] text-text">
            BTC, ETH, SOL perp
          </div>
        </label>
      </div>

      <div>
        <div className="flex justify-between text-[10.5px] text-text-faint mb-[5px]">
          <span>Peso da IA na decisão</span>
          <span className="font-mono text-ai">{aiWeight}%</span>
        </div>
        <Bar value={aiWeight} variant="ai" height={5} label={`Peso da IA na decisão: ${aiWeight}%`} />
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={aiWeight}
          onChange={(e) => setAiWeight(Number(e.target.value))}
          aria-label="Peso da IA na decisão"
          className="w-full mt-1.5 cursor-pointer"
          style={{ accentColor: 'var(--color-ai)', height: 14 }}
        />
        <p className="text-[10px] text-text-faint mt-[5px] leading-[1.4]">{aiWeightNote(aiWeight)}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRunBacktest}
          disabled={running || entries.length === 0}
          title={entries.length === 0 ? 'Adicione ao menos uma condição de entrada' : undefined}
          className="flex-1 h-8 bg-hover border border-border-strong rounded-md text-text-secondary text-xs cursor-pointer hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? 'Rodando…' : 'Rodar backtest'}
        </button>
        <button
          onClick={onActivateReal}
          disabled={entries.length === 0}
          title={entries.length === 0 ? 'Adicione ao menos uma condição de entrada' : undefined}
          className="flex-1 h-8 bg-down-bg border border-danger-border rounded-md text-down text-xs font-bold cursor-pointer hover:bg-down-strong disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-down-bg"
        >
          ⚠ Ativar em REAL
        </button>
      </div>
    </section>
  );
}
