import type { AssetDetailData } from '@/lib/data/views/assets';
import { Bar } from '@/components/ui/Bar';
import { SourceRef } from '@/components/ui/SourceRef';

interface AITabProps {
  ai: AssetDetailData['ai'];
}

export function AITab({ ai }: AITabProps) {
  return (
    <div className="py-3.5 flex flex-col gap-3">
      <p className="text-text-secondary leading-relaxed" style={{ fontSize: '12.5px' }}>
        {ai.thesis}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {ai.scenarios.map((sc) => {
          const isUp = sc.label === 'BULL' || sc.label === 'ALTA';
          const isDown = sc.label === 'BEAR' || sc.label === 'BAIXA';
          const color = isUp ? 'var(--color-up)' : isDown ? 'var(--color-down)' : 'var(--color-accent)';
          const borderColor = isUp ? 'var(--color-up-border)' : isDown ? 'var(--color-danger-border)' : 'var(--color-accent-border)';
          return (
            <div
              key={sc.label}
              className="bg-inset rounded-lg p-2.5"
              style={{ border: `1px solid ${borderColor}` }}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold" style={{ fontSize: '11px', color }}>
                  {sc.label}
                </span>
                <span className="ml-auto font-mono" style={{ fontSize: '12px', color }}>
                  {sc.prob}%
                </span>
              </div>
              <Bar
                value={sc.prob}
                variant={isUp ? 'up' : isDown ? 'down' : 'accent'}
                label={`probabilidade ${sc.prob}%`}
                className="my-1.5"
              />
              <div className="font-mono mb-1" style={{ fontSize: '11.5px' }}>
                {sc.target}
              </div>
              <div className="text-text-muted leading-snug" style={{ fontSize: '10.5px' }}>
                {sc.text}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <div
            className="text-text-faint mb-1.5"
            style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            Riscos
          </div>
          {ai.risks.map((r, i) => (
            <div key={i} className="text-text-secondary py-0.5 leading-snug" style={{ fontSize: '11.5px' }}>
              · {r}
            </div>
          ))}
        </div>
        <div>
          <div
            className="text-text-faint mb-1.5"
            style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            O que invalidaria a tese
          </div>
          {ai.invalidations.map((iv, i) => (
            <div key={i} className="text-warn py-0.5 leading-snug" style={{ fontSize: '11.5px' }}>
              ✕ {iv}
            </div>
          ))}
        </div>
      </div>
      <div className="text-text-faint" style={{ fontSize: '10.5px' }}>
        fontes:{' '}
        {ai.sources.map((s, i) => (
          <span key={i}>
            <SourceRef source={s.label} className="text-accent">
              {s.label}
            </SourceRef>
            {i < ai.sources.length - 1 && ' · '}
          </span>
        ))}
        <span className="ml-2.5 font-mono">
          gerado há {ai.generatedAgo} · {ai.model}
        </span>
      </div>
    </div>
  );
}
