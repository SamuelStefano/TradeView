'use client';

import { Bar } from '@/components/ui/Bar';

interface BuilderPanelProps {
  onActivateReal: () => void;
}

interface EntryCondition {
  a: string;
  op: string;
  b: string;
}

const entries: EntryCondition[] = [
  { a: 'funding_8h', op: '<', b: '−0,010%' },
  { a: 'open_interest_Δ48h', op: '>', b: '+5%' },
  { a: 'preço', op: '≥', b: 'MA(21) no 4h' },
  { a: 'convicção_IA', op: '≥', b: '40' },
];

export function BuilderPanel({ onActivateReal }: BuilderPanelProps) {
  return (
    <section
      aria-label="Builder"
      className="bg-surface border border-border rounded-lg p-3.5 flex flex-col gap-3"
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
            key={i}
            className="flex items-center gap-2 bg-inset border border-border rounded-md px-2.5 py-[7px] font-mono text-[11px]"
          >
            <span className="text-accent-hover">{e.a}</span>
            <span className="text-text-faint">{e.op}</span>
            <span className="text-text">{e.b}</span>
            <button
              aria-label="remover condição"
              className="ml-auto bg-transparent border-none text-text-faint cursor-pointer text-[11px] hover:text-text-muted"
            >
              ✕
            </button>
          </div>
        ))}
        <button className="h-[26px] border border-dashed border-border-strong rounded-md bg-transparent text-text-faint text-[11px] cursor-pointer hover:text-text-muted">
          + condição
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
          <span className="font-mono text-ai">35%</span>
        </div>
        <Bar value={35} variant="ai" height={5} label="Peso da IA na decisão: 35%" />
        <p className="text-[10px] text-text-faint mt-[5px] leading-[1.4]">
          Com 35%, a IA pode vetar entradas (convicção &lt; 40) mas não pode abrir posição sozinha.
        </p>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 h-8 bg-hover border border-border-strong rounded-md text-text-secondary text-xs cursor-pointer hover:text-text">
          Rodar backtest
        </button>
        <button
          onClick={onActivateReal}
          className="flex-1 h-8 bg-down-bg border border-danger-border rounded-md text-down text-xs font-bold cursor-pointer hover:bg-down-strong"
        >
          ⚠ Ativar em REAL
        </button>
      </div>
    </section>
  );
}
