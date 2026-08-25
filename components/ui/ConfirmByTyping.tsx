'use client';

import { useState } from 'react';
import { Modal } from './Modal';

interface ConfirmByTypingProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  phrase: string;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
}

export function ConfirmByTyping({
  open,
  onClose,
  onConfirm,
  phrase,
  title,
  description,
  confirmLabel,
  danger = false,
}: ConfirmByTypingProps) {
  const [text, setText] = useState('');
  const matched = text.trim() === phrase;

  function handleConfirm() {
    if (!matched) return;
    onConfirm();
    setText('');
  }

  function handleClose() {
    onClose();
    setText('');
  }

  return (
    <Modal open={open} onClose={handleClose} label={title} className="w-[480px] p-6 flex flex-col gap-3.5">
      <div
        className={`text-base font-bold ${danger ? 'text-down' : 'text-text'}`}
      >
        {title}
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
      <label className="text-xs text-text-muted flex flex-col gap-1.5">
        Para confirmar, digite{' '}
        <span className="font-mono text-text">{phrase}</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1.5 w-full h-[34px] px-2.5 bg-base border border-border-strong rounded-md text-text font-mono text-sm outline-none focus-visible:outline-accent"
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
          className="h-8 px-3.5 rounded-md text-white text-xs font-semibold cursor-pointer font-sans border border-danger-border transition-colors"
          style={{
            background: matched ? 'var(--color-danger-solid)' : '#3A1A20',
            opacity: matched ? 1 : 0.6,
            cursor: matched ? 'pointer' : 'not-allowed',
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
