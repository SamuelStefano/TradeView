'use client';

import { useState, useEffect, useRef } from 'react';
import { useShellHealth } from './health-context';

interface KillSwitchModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PHRASE = 'desativar tudo';

export function KillSwitchModal({ open, onClose, onConfirm }: KillSwitchModalProps) {
  const { realStrategies, connected } = useShellHealth();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const matched = text.trim() === PHRASE;

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
      if (e.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
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

  function handleClose() {
    onClose();
    setText('');
  }

  function handleConfirm() {
    if (!matched) return;
    onConfirm();
  }

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--color-scrim) 75%, transparent)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-label="Confirmar kill switch"
        aria-modal="true"
        className="flex flex-col gap-3.5 border border-danger-border rounded-xl"
        style={{ width: 480, background: 'var(--color-surface)', padding: 24 }}
      >
        <div className="text-base font-bold text-down">⏻ Kill switch global</div>
        <p className="text-sm leading-relaxed text-text-secondary">
          Isto vai{' '}
          <strong className="text-text">cancelar todas as ordens abertas</strong>,{' '}
          <strong className="text-text">
            pausar {realStrategies} {realStrategies === 1 ? 'estratégia real' : 'estratégias reais'}
          </strong>{' '}
          e <strong className="text-text">bloquear novas ordens</strong> nas {connected} integrações
          conectadas até reativação manual.
        </p>
        <label className="text-xs text-text-muted flex flex-col">
          Para confirmar, digite{' '}
          <span className="font-mono text-text">{PHRASE}</span>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1.5 w-full h-[34px] px-2.5 bg-base border border-border-strong rounded-md text-text font-mono text-sm outline-none"
            autoComplete="off"
          />
        </label>
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleClose}
            className="h-8 px-3.5 bg-hover border border-border-strong rounded-md text-text-secondary text-xs cursor-pointer font-sans hover:text-text"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!matched}
            className="h-8 px-3.5 rounded-md text-white text-xs font-semibold font-sans border border-danger-border"
            style={{
              background: matched ? 'var(--color-danger-solid)' : 'var(--color-danger-hover)',
              opacity: matched ? 1 : 0.6,
              cursor: matched ? 'pointer' : 'not-allowed',
            }}
          >
            Desativar tudo agora
          </button>
        </div>
      </div>
    </div>
  );
}
