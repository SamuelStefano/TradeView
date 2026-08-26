'use client';

const MODELS = ['claude-sonnet-4-6', 'claude-opus-4-7', 'claude-haiku-4-5-20251001'] as const;

export type Model = (typeof MODELS)[number];

interface ChatHeaderProps {
  model: Model;
  onModelChange: (model: Model) => void;
  onNewConversation: () => void;
  canReset: boolean;
}

export function ChatHeader({ model, onModelChange, onNewConversation, canReset }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 px-[18px] py-2.5 border-b border-border">
      <span className="font-semibold text-sm">✦ IA Analyst</span>
      <span className="text-text-faint" style={{ fontSize: '10.5px' }}>
        sem acesso a cotação ou portfólio
      </span>
      <div className="ml-auto flex gap-1.5 items-center">
        <button
          onClick={onNewConversation}
          disabled={!canReset}
          className="h-[26px] px-2.5 bg-hover border border-border-strong rounded-md text-text-secondary cursor-pointer hover:text-text disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontSize: '11.5px' }}
        >
          Nova conversa
        </button>
        <label htmlFor="model-select" className="text-text-faint" style={{ fontSize: '10.5px' }}>
          modelo
        </label>
        <select
          id="model-select"
          value={model}
          onChange={(e) => onModelChange(e.target.value as Model)}
          className="h-[26px] bg-surface border border-border-strong rounded-md text-text-secondary cursor-pointer"
          style={{ fontSize: '11.5px', padding: '0 6px' }}
        >
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
