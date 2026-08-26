interface AssistantMessageProps {
  model: string;
  text: string;
  pending: boolean;
}

export function AssistantMessage({ model, text, pending }: AssistantMessageProps) {
  return (
    <div className="flex flex-col gap-1.5" style={{ maxWidth: '86%' }}>
      <div className="flex items-center gap-2 text-text-faint" style={{ fontSize: '10.5px' }}>
        <span className="text-accent" aria-hidden="true">
          ✦
        </span>
        <span className="font-mono">{model}</span>
        {pending && text === '' && <span>pensando…</span>}
      </div>
      <div
        className="bg-surface border border-border text-sm leading-relaxed whitespace-pre-wrap"
        style={{ borderRadius: '10px 10px 10px 2px', padding: '10px 14px' }}
      >
        {text}
        {pending && text !== '' && <span className="text-accent">▍</span>}
      </div>
      <span className="text-text-faint" style={{ fontSize: '10px' }}>
        não é recomendação de investimento
      </span>
    </div>
  );
}
