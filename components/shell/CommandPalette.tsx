'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PaletteResult {
  kind: string;
  label: string;
  hint: string;
  href: string;
}

const ALL_RESULTS: PaletteResult[] = [
  { kind: 'ATIVO', label: 'BTC/USDT — Binance perp', hint: 'US$ 67.412', href: '/asset/BTC-USD' },
  { kind: 'ATIVO', label: 'PETR4 — B3', hint: 'R$ 38,42', href: '/asset/PETR4' },
  { kind: 'ATIVO', label: 'Tesouro IPCA+ 2035', hint: 'IPCA + 6,21%', href: '/asset/NTNB-2035' },
  { kind: 'ATIVO', label: 'PLD Sudeste — spot', hint: 'R$ 141,20/MWh', href: '/asset/PLD-SE' },
  { kind: 'TELA', label: 'Portfólio consolidado', hint: 'g p', href: '/portfolio' },
  { kind: 'TELA', label: 'Estratégias e bots', hint: 'g s', href: '/strategies' },
  { kind: 'AÇÃO', label: 'Criar alerta em linguagem natural', hint: '', href: '/alerts' },
  { kind: 'AÇÃO', label: 'Perguntar à IA sobre o portfólio', hint: '', href: '/chat' },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const prev = document.activeElement as HTMLElement | null;
    const id = setTimeout(() => inputRef.current?.focus(), 50);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button, input');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(id);
      document.removeEventListener('keydown', onKeyDown);
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const q = query.toLowerCase();
  const results = q
    ? ALL_RESULTS.filter((r) => r.label.toLowerCase().includes(q))
    : ALL_RESULTS;

  function go(href: string) {
    router.push(href);
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--color-scrim) 60%, transparent)', zIndex: 60, display: 'flex', justifyContent: 'center', paddingTop: '12vh' }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Busca global"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="border border-border-hover rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: 560, maxHeight: 420, background: 'var(--color-surface)', height: 'fit-content' }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite um ativo, mercado ou ação…"
          aria-label="Buscar ativo, mercado ou ação"
          className="border-b border-border text-text font-sans outline-none bg-transparent"
          style={{ height: 44, padding: '0 16px', fontSize: 14 }}
        />
        <div className="overflow-y-auto p-1.5">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => go(r.href)}
              className="flex items-center gap-2.5 w-full rounded-md border-none text-text text-left cursor-pointer font-sans hover:bg-hover"
              style={{ padding: '8px 10px', background: 'transparent', fontSize: 12.5 }}
            >
              <span
                className="font-mono text-text-faint"
                style={{ fontSize: 10, width: 52, flexShrink: 0 }}
              >
                {r.kind}
              </span>
              {r.label}
              {r.hint && (
                <span className="ml-auto font-mono text-text-faint" style={{ fontSize: 11 }}>
                  {r.hint}
                </span>
              )}
            </button>
          ))}
          {results.length === 0 && (
            <div className="text-center text-text-muted py-6" style={{ fontSize: 12 }}>
              Nenhum resultado para &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
