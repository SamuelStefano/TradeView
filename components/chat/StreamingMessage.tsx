import { Skeleton } from '@/components/ui/Skeleton';

interface StreamStep {
  t: string;
  meta: string;
  icon: string;
  fgClass: string;
}

interface StreamingMessageProps {
  model: string;
  steps: StreamStep[];
  streamText: string;
  phase: number;
  onSimulateFailure: () => void;
}

export function StreamingMessage({
  model,
  steps,
  streamText,
  phase,
  onSimulateFailure,
}: StreamingMessageProps) {
  return (
    <div className="flex flex-col gap-2" style={{ maxWidth: '86%' }}>
      <div className="flex items-center gap-2 text-text-faint" style={{ fontSize: '10.5px' }}>
        <span className="text-ai animate-shimmer" aria-hidden="true">✦</span>
        {model} · raciocinando
      </div>
      <div
        className="bg-inset border border-ai-border flex flex-col gap-1.5"
        style={{
          borderRadius: '2px 10px 10px 10px',
          padding: '12px 16px',
        }}
        role="status"
        aria-label={`IA processando: ${steps.filter((s) => s.icon === '✓').length} de ${steps.length} etapas concluídas`}
        aria-live="polite"
      >
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 ${step.fgClass}`}
            style={{ fontSize: '11.5px' }}
          >
            <span className="font-mono text-center" style={{ width: '14px' }}>
              {step.icon}
            </span>
            {step.t}
            <span className="ml-auto font-mono text-text-faint" style={{ fontSize: '10px' }}>
              {step.meta}
            </span>
          </div>
        ))}
        <div className="h-px bg-border my-0.5" />
        {phase >= 2 && streamText ? (
          <div className="leading-relaxed" style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
            {streamText}
            <span className="text-ai animate-shimmer" aria-hidden="true">▍</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 pt-1">
            <Skeleton height={12} width="90%" />
            <Skeleton height={12} width="75%" />
            <Skeleton height={12} width="60%" />
          </div>
        )}
      </div>
      <button
        onClick={onSimulateFailure}
        className="self-start h-6 px-2 text-text-faint cursor-pointer hover:text-text-secondary transition-colors"
        style={{
          fontSize: '10px',
          background: 'none',
          border: '1px dashed var(--color-danger-border)',
          borderRadius: '5px',
          color: 'var(--color-text-faint)',
        }}
      >
        simular falha da IA
      </button>
    </div>
  );
}
