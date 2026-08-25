import { AttributionBar } from './AttributionBar';
import { RiskMatrix } from './RiskMatrix';

interface AttributionRow {
  sym: string;
  v: string;
  w: string;
  tone: 'up' | 'down';
  src: string;
}

interface RiskCell {
  t: string;
  bgClass: string;
  fgClass: string;
}

interface RiskRow {
  factor: string;
  cells: RiskCell[];
}

interface SuggestedAction {
  label: string;
}

interface AIMessageProps {
  model: string;
  time: string;
  sourcesCount: number;
  attribution: AttributionRow[];
  riskMatrix: RiskRow[];
  suggestedActions: SuggestedAction[];
}

export function AIMessage({
  model,
  time,
  sourcesCount,
  attribution,
  riskMatrix,
  suggestedActions,
}: AIMessageProps) {
  return (
    <div className="flex flex-col gap-2.5" style={{ maxWidth: '86%' }}>
      <div className="flex items-center gap-2 text-text-faint" style={{ fontSize: '10.5px' }}>
        <span className="text-ai">✦</span>
        {model} · <span className="font-mono">{time}</span> · {sourcesCount} fontes consultadas
      </div>
      <div
        className="bg-inset border border-border text-sm leading-relaxed"
        style={{
          borderRadius: '2px 10px 10px 10px',
          padding: '14px 16px',
          color: 'var(--color-text-secondary)',
          lineHeight: '1.6',
        }}
      >
        Seu portfólio caiu{' '}
        <a href="#" title="fonte: P&L consolidado, 52 integrações">
          −R$ 8.112 (−0,28%)
        </a>{' '}
        hoje. Três fatores explicam{' '}
        <a href="#" title="fonte: atribuição de performance por posição">
          91% da queda
        </a>
        :
        <AttributionBar rows={attribution} />
        Sobre o risco escondido: sua maior exposição não é a nenhum ativo, é à{' '}
        <strong className="text-text">curva de juros real brasileira</strong>. Somando NTN-Bs,
        FIIs (correlação{' '}
        <a href="#" title="fonte: matriz de correlação 90d">
          0,81
        </a>{' '}
        com a B35) e ações de utilities,{' '}
        <a href="#" title="fonte: decomposição de fatores de risco">
          41% do patrimônio
        </a>{' '}
        responde ao mesmo fator.
        <RiskMatrix rows={riskMatrix} />
        <div className="mt-2.5 text-text-faint" style={{ fontSize: '11px' }}>
          fontes:{' '}
          <a href="#">atribuição de P&L</a> ·{' '}
          <a href="#">matriz de correlação 90d</a> ·{' '}
          <a href="#">curva ANBIMA</a> ·{' '}
          <a href="#">posições consolidadas</a>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {suggestedActions.map((action) => (
          <button
            key={action.label}
            className="h-[26px] px-2.5 bg-inset border border-border-strong rounded-md text-text-muted cursor-pointer hover:bg-hover hover:text-text-secondary transition-colors"
            style={{ fontSize: '11px' }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
