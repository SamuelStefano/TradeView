'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const CONFIRM_PHRASE = 'ativar modo real';

interface RealModeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RealModeModal({ open, onClose, onConfirm }: RealModeModalProps) {
  const [text, setText] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const matched = text.trim().toLowerCase() === CONFIRM_PHRASE;

  const handleClose = useCallback(() => {
    setText('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const prev = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      prev?.focus();
    };
  }, [open, handleClose]);

  function handleConfirm() {
    if (!matched) return;
    setText('');
    onConfirm();
  }

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--color-scrim) 78%, transparent)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={handleClose}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-label="Ativar estratégia em modo real"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-[500px] bg-surface border-2 border-danger-solid rounded-xl overflow-hidden"
      >
        <div className="bg-danger-solid px-4 py-2 text-[11px] font-bold tracking-[1.5px] text-white">
          MODO REAL — DINHEIRO DE VERDADE
        </div>
        <div className="p-5 flex flex-col gap-3">
          <p className="text-[13px] leading-relaxed text-text-secondary">
            Você está ativando{' '}
            <strong className="text-text">Funding Squeeze v2</strong> em modo real na{' '}
            <strong className="text-text">Binance</strong>, operando{' '}
            <strong className="text-text">bitcoin, ethereum e solana perpétuos</strong> com até{' '}
            <strong className="text-text">dois por cento do capital por operação</strong>{' '}
            (hoje:{' '}
            <span className="font-mono">R$ 56.946,24</span> por trade).
          </p>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Backtest não garante resultado futuro. O kill switch global interrompe esta estratégia imediatamente.
          </p>
          <label className="text-[11.5px] text-text-muted flex flex-col gap-1.5">
            Digite{' '}
            <span className="font-mono text-text">{CONFIRM_PHRASE}</span>{' '}
            para confirmar
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1.5 w-full h-[34px] px-2.5 bg-base border border-border-strong rounded-md text-text font-mono text-[13px] outline-none focus-visible:outline-accent"
              autoComplete="off"
              aria-label={`Digite ${CONFIRM_PHRASE} para confirmar`}
            />
          </label>
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleClose}
              className="h-8 px-3.5 bg-hover border border-border-strong rounded-md text-text-secondary text-xs cursor-pointer hover:text-text"
            >
              Manter em paper
            </button>
            <button
              onClick={handleConfirm}
              disabled={!matched}
              aria-disabled={!matched}
              className={`h-8 px-3.5 border border-danger-border rounded-md text-white text-xs font-bold transition-colors ${matched ? 'bg-danger-solid opacity-100 cursor-pointer' : 'bg-down-strong opacity-60 cursor-not-allowed'}`}
            >
              Ativar em REAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
