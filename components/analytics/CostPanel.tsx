import type { CostBar } from '@/lib/data/mock/analytics';

interface CostPanelProps {
  costTokens: string;
  costAI: string;
  costData: string;
  costBars: CostBar[];
}

export function CostPanel({ costTokens, costAI, costData, costBars }: CostPanelProps) {
  return (
    <section
      aria-label="Custo de IA e dados"
      className="bg-surface border border-border rounded-lg p-3.5"
    >
      <div
        className="text-text-muted uppercase mb-2.5"
        style={{ fontSize: '11px', letterSpacing: '0.6px' }}
      >
        Custo de IA e dados · agosto
      </div>

      <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="bg-inset border border-border rounded-md" style={{ padding: '8px 10px' }}>
          <div className="text-text-faint" style={{ fontSize: '9.5px' }}>Tokens IA</div>
          <div className="font-mono font-semibold text-text text-right" style={{ fontSize: '13.5px' }}>
            {costTokens}
          </div>
        </div>
        <div className="bg-inset border border-border rounded-md" style={{ padding: '8px 10px' }}>
          <div className="text-text-faint" style={{ fontSize: '9.5px' }}>Custo IA</div>
          <div className="font-mono font-semibold text-text text-right" style={{ fontSize: '13.5px' }}>
            {costAI}
          </div>
        </div>
        <div className="bg-inset border border-border rounded-md" style={{ padding: '8px 10px' }}>
          <div className="text-text-faint" style={{ fontSize: '9.5px' }}>Dados/APIs</div>
          <div className="font-mono font-semibold text-text text-right" style={{ fontSize: '13.5px' }}>
            {costData}
          </div>
        </div>
      </div>

      <svg
        viewBox="0 0 320 90"
        style={{ width: '100%' }}
        role="img"
        aria-label="Custo diário em agosto — barras por dia, pico em 22/08 com US$ 31,20"
      >
        <title>Custo diário — agosto</title>
        <desc>Gráfico de barras mostrando o custo diário de IA em agosto. O pico foi em 22/08 durante backtests, com US$ 31,20.</desc>
        {costBars.map((cb, i) => (
          <rect
            key={i}
            x={cb.x}
            y={cb.y}
            width={9}
            height={cb.h}
            className="fill-accent"
            opacity={0.6}
            rx={1}
          />
        ))}
        <line x1="0" x2="320" y1="80" y2="80" className="stroke-border" />
      </svg>

      <div className="font-mono text-text-faint" style={{ fontSize: '10px' }}>
        custo/dia · pico 22/08 (backtests) US$ 31,20
      </div>
    </section>
  );
}
