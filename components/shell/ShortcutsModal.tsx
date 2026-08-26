'use client';

import { useEffect, useRef } from 'react';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const GROUPS: { title: string; items: { keys: string; label: string }[] }[] = [
  {
    title: 'Navegação',
    items: [
      { keys: 'g o', label: 'Overview' },
      { keys: 'g a', label: 'Ativos' },
      { keys: 'g p', label: 'Portfólio' },
      { keys: 'g s', label: 'Estratégias' },
    ],
  },
  {
    title: 'Busca',
    items: [
      { keys: 'Ctrl K', label: 'Abrir busca global' },
      { keys: '↑ ↓', label: 'Percorrer resultados' },
      { keys: 'Enter', label: 'Abrir resultado' },
    ],
  },
  {
    title: 'Geral',
    items: [
      { keys: '?', label: 'Esta lista' },
      { keys: 'Esc', label: 'Fechar sobreposições' },
    ],
  },
];

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const prev = document.activeElement as HTMLElement | null;
    const id = setTimeout(() => closeRef.current?.focus(), 50);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      e.preventDefault();
      closeRef.current?.focus();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(id);
      document.removeEventListener('keydown', onKeyDown);
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--color-scrim) 60%, transparent)', zIndex: 65, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Atalhos de teclado"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 border border-border-hover rounded-xl shadow-2xl"
        style={{ width: 460, background: 'var(--color-surface)', padding: 22 }}
      >
        <div className="flex items-center">
          <span className="text-sm font-semibold text-text">Atalhos de teclado</span>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Fechar atalhos"
            className="ml-auto h-7 px-2.5 bg-hover border border-border-strong rounded-md text-text-secondary cursor-pointer font-sans hover:text-text"
            style={{ fontSize: 11 }}
          >
            Esc
          </button>
        </div>

        {GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-1.5">
            <div className="font-mono text-text-faint" style={{ fontSize: 10 }}>
              {group.title.toUpperCase()}
            </div>
            {group.items.map((item) => (
              <div key={item.keys} className="flex items-center gap-3 text-text-secondary" style={{ fontSize: 12 }}>
                <span
                  className="font-mono text-text border border-border-strong rounded bg-base text-center flex-shrink-0"
                  style={{ fontSize: 11, padding: '2px 0', width: 68 }}
                >
                  {item.keys}
                </span>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
