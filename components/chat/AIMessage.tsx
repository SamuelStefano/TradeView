'use client';

import { SourceRef } from '@/components/ui/SourceRef';
import { useShellHealth } from '@/components/shell/health-context';
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
  onSuggestedAction: (label: string) => void;
}

export function AIMessage({
  model,
  time,
  sourcesCount,
  attribution,
  riskMatrix,
  suggestedActions,
  onSuggestedAction,
}: AIMessageProps) {
  const { connected } = useShellHealth();

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
        <SourceRef source={`P&L consolidado, ${connected} integrações`} className="text-accent">
          −R$ 8.112 (−0,28%)
        </SourceRef>{' '}
        hoje. Três fatores explicam{' '}
        <SourceRef source="atribuição de performance por posição" className="text-accent">
          91% da queda
        </SourceRef>
        :
        <AttributionBar rows={attribution} />
        Sobre o risco escondido: sua maior exposição não é a nenhum ativo, é à{' '}
        <strong className="text-text">curva de juros real brasileira</strong>. Somando NTN-Bs,
        FIIs (correlação{' '}
        <SourceRef source="matriz de correlação 90d" className="text-accent">
          0,81
        </SourceRef>{' '}
        com a B35) e ações de utilities,{' '}
        <SourceRef source="decomposição de fatores de risco" className="text-accent">
          41% do patrimônio
        </SourceRef>{' '}
        responde ao mesmo fator.
        <RiskMatrix rows={riskMatrix} />
        <div className="mt-2.5 text-text-faint" style={{ fontSize: '11px' }}>
          fontes:{' '}
          <SourceRef source="atribuição de P&L">atribuição de P&L</SourceRef> ·{' '}
          <SourceRef source="matriz de correlação 90d">matriz de correlação 90d</SourceRef> ·{' '}
          <SourceRef source="curva ANBIMA">curva ANBIMA</SourceRef> ·{' '}
          <SourceRef source="posições consolidadas">posições consolidadas</SourceRef>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {suggestedActions.map((action) => (
          <button
            key={action.label}
            onClick={() => onSuggestedAction(action.label)}
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
