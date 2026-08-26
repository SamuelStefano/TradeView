import { Bar } from '@/components/ui/Bar';
import { SourceRef } from '@/components/ui/SourceRef';

interface Correlation {
  symbol: string;
  value: number;
}

interface CorrTabProps {
  correlations: Correlation[];
}

export function CorrTab({ correlations }: CorrTabProps) {
  const pos = correlations.filter((c) => c.value >= 0);
  const neg = correlations.filter((c) => c.value < 0);

  return (
    <div
      className="py-3"
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
    >
      <div>
        <div
          className="text-text-faint mb-2"
          style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          Anda junto
        </div>
        {pos.map((c) => (
          <div key={c.symbol} className="flex items-center gap-2 py-1">
            <span className="font-mono text-text shrink-0" style={{ fontSize: '11.5px', width: '90px' }}>
              {c.symbol}
            </span>
            <Bar
              value={c.value * 100}
              variant="up"
              label={`correlação positiva ${c.value.toFixed(2).replace('.', ',')}`}
              className="flex-1"
            />
            <span className="font-mono text-up w-10 text-right shrink-0" style={{ fontSize: '11px' }}>
              {c.value.toFixed(2).replace('.', ',')}
            </span>
          </div>
        ))}
      </div>
      <div>
        <div
          className="text-text-faint mb-2"
          style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          Anda contra
        </div>
        {neg.map((c) => (
          <div key={c.symbol} className="flex items-center gap-2 py-1">
            <span className="font-mono text-text shrink-0" style={{ fontSize: '11.5px', width: '90px' }}>
              {c.symbol}
            </span>
            <Bar
              value={Math.abs(c.value) * 100}
              variant="down"
              label={`correlação negativa ${c.value.toFixed(2).replace('.', ',')}`}
              className="flex-1"
            />
            <span className="font-mono text-down w-10 text-right shrink-0" style={{ fontSize: '11px' }}>
              {c.value.toFixed(2).replace('.', ',')}
            </span>
          </div>
        ))}
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <span className="text-text-faint" style={{ fontSize: '10px' }}>
          janela 90 dias · retornos diários ·{' '}
          <SourceRef source="correlação de Pearson sobre retornos diários, janela móvel de 90 dias" className="text-accent">
            metodologia
          </SourceRef>
        </span>
      </div>
    </div>
  );
}
