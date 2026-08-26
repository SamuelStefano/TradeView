'use client';

import { useMemo, useState } from 'react';
import type { TradeRecord } from '@/lib/data/views/portfolio';
import { ExportCsvButton } from '@/components/ui/ExportCsvButton';

interface TradesTableProps {
  trades: TradeRecord[];
}

const COL_HEADERS = [
  { label: 'data/hora', align: 'left' },
  { label: 'ativo', align: 'left' },
  { label: 'lado', align: 'left' },
  { label: 'qtd.', align: 'right' },
  { label: 'preço', align: 'right' },
  { label: 'total', align: 'right' },
  { label: 'resultado', align: 'right' },
  { label: 'origem', align: 'right' },
];

function resultTone(result: string): string {
  if (result === '—') return 'text-text-faint';
  if (result.startsWith('+')) return 'text-up';
  return 'text-down';
}

type OriginFilter = 'todas' | 'manual' | 'bot';
type SideFilter = 'todos' | 'COMPRA' | 'VENDA';

const ORIGIN_LABEL: Record<OriginFilter, string> = {
  todas: 'Manual + bots',
  manual: 'Só manual',
  bot: 'Só bots',
};

const SIDE_LABEL: Record<SideFilter, string> = {
  todos: 'Compra + venda',
  COMPRA: 'Só compra',
  VENDA: 'Só venda',
};

export function TradesTable({ trades }: TradesTableProps) {
  const [origin, setOrigin] = useState<OriginFilter>('todas');
  const [side, setSide] = useState<SideFilter>('todos');

  const filtered = useMemo(
    () =>
      trades.filter((t) => {
        const isBot = t.origin.toLowerCase().includes('bot');
        if (origin === 'manual' && isBot) return false;
        if (origin === 'bot' && !isBot) return false;
        if (side !== 'todos' && t.side !== side) return false;
        return true;
      }),
    [trades, origin, side],
  );

  return (
    <section
      aria-label="Histórico de trades"
      className="bg-surface border border-border rounded-lg p-3.5"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className="text-text-muted uppercase"
          style={{ fontSize: '11px', letterSpacing: '0.6px' }}
        >
          Histórico de trades
        </span>
        <div className="flex gap-1.5 ml-2.5">
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value as OriginFilter)}
            aria-label="Filtrar por origem"
            className="bg-inset border border-border-strong rounded text-text-muted cursor-pointer"
            style={{ height: '24px', fontSize: '10.5px', fontFamily: 'inherit', padding: '0 6px' }}
          >
            {(Object.keys(ORIGIN_LABEL) as OriginFilter[]).map((k) => (
              <option key={k} value={k}>{ORIGIN_LABEL[k]}</option>
            ))}
          </select>
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as SideFilter)}
            aria-label="Filtrar por lado"
            className="bg-inset border border-border-strong rounded text-text-muted cursor-pointer"
            style={{ height: '24px', fontSize: '10.5px', fontFamily: 'inherit', padding: '0 6px' }}
          >
            {(Object.keys(SIDE_LABEL) as SideFilter[]).map((k) => (
              <option key={k} value={k}>{SIDE_LABEL[k]}</option>
            ))}
          </select>
          <span className="text-text-faint self-center" style={{ fontSize: '10px' }}>
            {filtered.length} de {trades.length}
          </span>
        </div>
        <div className="flex-1" />
        <ExportCsvButton
          headers={['data/hora', 'ativo', 'lado', 'qtd.', 'preco', 'total', 'resultado', 'origem']}
          rows={filtered.map((t) => [t.datetime, t.asset, t.side, t.qty, t.price, t.total, t.result, t.origin])}
          filename="tradeview-trades"
          style={{ height: '26px', padding: '0 11px', fontSize: '11px', fontFamily: 'inherit' }}
        />
      </div>
      <div className="font-mono tabular-nums overflow-x-auto" style={{ fontSize: '11px' }}>
        <table className="w-full" aria-label="Trades">
          <thead>
            <tr className="border-b border-border">
              {COL_HEADERS.map(({ label, align }) => (
                <th
                  key={label}
                  scope="col"
                  className={`py-1.5 px-2 text-text-faint font-medium ${align === 'right' ? 'text-right' : 'text-left'}`}
                  style={{ fontSize: '10px' }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((h, idx) => (
              <tr key={idx} className="border-b border-divider text-text-secondary">
                <td className="py-1.5 px-2 text-text-faint">{h.datetime}</td>
                <td className="py-1.5 px-2">{h.asset}</td>
                <td
                  className="py-1.5 px-2"
                  style={{ color: h.side === 'COMPRA' ? 'var(--color-up)' : 'var(--color-down)' }}
                >
                  {h.side}
                </td>
                <td className="py-1.5 px-2 text-right">{h.qty}</td>
                <td className="py-1.5 px-2 text-right">{h.price}</td>
                <td className="py-1.5 px-2 text-right">{h.total}</td>
                <td className={`py-1.5 px-2 text-right ${resultTone(h.result)}`}>
                  {h.result}
                </td>
                <td className="py-1.5 px-2 text-right text-text-faint">{h.origin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
