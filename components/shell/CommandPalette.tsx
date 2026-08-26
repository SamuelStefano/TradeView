'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TRADABLE, VENUE_INFO, toSlug } from '@/lib/markets/catalogue';

interface PaletteResult {
  kind: string;
  label: string;
  hint: string;
  href: string;
}

// Built from the catalogue so the palette can only offer symbols the asset page
// can actually open. The hint is the venue, not a price: the palette renders
// without a fetch and a stale quote here would be worse than none.
const ALL_RESULTS: PaletteResult[] = [
  ...TRADABLE.map((t) => ({
    kind: 'ATIVO',
    label: t.symbol,
    hint: VENUE_INFO[t.venue]?.name ?? t.venue,
    href: `/asset/${toSlug(t.symbol)}`,
  })),
  { kind: 'TELA', label: 'Portfólio consolidado', hint: 'g p', href: '/portfolio' },
  { kind: 'TELA', label: 'Mercados conectados', hint: '', href: '/markets' },
  { kind: 'TELA', label: 'Mesa de operações', hint: 'g m', href: '/trade' },
  { kind: 'AÇÃO', label: 'Depositar saldo na conta paper', hint: '', href: '/trade' },
  { kind: 'AÇÃO', label: 'Abrir o Analyst', hint: '', href: '/chat' },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const router = useRouter();

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery('');
      setHighlighted(0);
    }
  }

  const q = query.toLowerCase();
  const results = q
    ? ALL_RESULTS.filter((r) => r.label.toLowerCase().includes(q))
    : ALL_RESULTS;

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

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (results.length === 0) return;
        const step = e.key === 'ArrowDown' ? 1 : -1;
        setHighlighted((i) => (i + step + results.length) % results.length);
        return;
      }

      if (e.key === 'Enter') {
        const target = results[highlighted];
        if (!target) return;
        e.preventDefault();
        router.push(target.href);
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
  }, [open, onClose, results, highlighted, router]);

  if (!open) return null;

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
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
          }}
          placeholder="Digite um ativo, mercado ou ação…"
          aria-label="Buscar ativo, mercado ou ação"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-activedescendant={results[highlighted] ? `${listId}-${highlighted}` : undefined}
          autoComplete="off"
          className="border-b border-border text-text font-sans outline-none bg-transparent"
          style={{ height: 44, padding: '0 16px', fontSize: 14 }}
        />
        <div id={listId} role="listbox" aria-label="Resultados" className="overflow-y-auto p-1.5">
          {results.map((r, i) => (
            <button
              key={i}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === highlighted}
              tabIndex={-1}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => go(r.href)}
              className="flex items-center gap-2.5 w-full rounded-md border-none text-text text-left cursor-pointer font-sans"
              style={{
                padding: '8px 10px',
                background: i === highlighted ? 'var(--color-hover)' : 'transparent',
                fontSize: 12.5,
              }}
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
