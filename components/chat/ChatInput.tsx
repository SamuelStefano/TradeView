'use client';

import { useRef, useState } from 'react';

interface ChatInputProps {
  onSend: () => void;
  sessionCost: string;
}

export function ChatInput({ onSend, sessionCost }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend();
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="px-[22px] py-3 border-t border-border">
      <div className="flex gap-2 items-end bg-inset border border-border-strong rounded-xl px-3 py-2.5 focus-within:border-accent transition-colors">
        <label htmlFor="chat-input" className="sr-only">
          Mensagem para a IA Analyst
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre qualquer ativo, mercado ou sobre o seu portfólio…"
          className="flex-1 bg-transparent border-none text-text text-sm outline-none resize-none leading-relaxed placeholder:text-text-faint"
          style={{ minHeight: '22px', maxHeight: '120px' }}
          aria-label="Mensagem para a IA Analyst"
        />
        <button
          aria-label="Enviar"
          onClick={handleSend}
          disabled={!value.trim()}
          className="w-[30px] h-[30px] bg-accent border-none rounded-md text-white cursor-pointer hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          style={{ fontSize: '13px' }}
        >
          ↑
        </button>
      </div>
      <div className="flex gap-3.5 mt-1.5 text-text-faint" style={{ fontSize: '10px' }}>
        <span>Shift+Enter quebra linha</span>
        <span>a IA vê posições, ordens e alertas — nunca chaves de API</span>
        <span className="ml-auto">
          custo da sessão:{' '}
          <span className="font-mono tabular-nums">{sessionCost}</span>
        </span>
      </div>
    </div>
  );
}
