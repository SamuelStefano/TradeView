interface RiskCell {
  t: string;
  bgClass: string;
  fgClass: string;
}

interface RiskRow {
  factor: string;
  cells: RiskCell[];
}

interface RiskMatrixProps {
  rows: RiskRow[];
}

export function RiskMatrix({ rows }: RiskMatrixProps) {
  return (
    <div
      className="bg-inset border border-border rounded-md mt-3"
      style={{ padding: '12px' }}
    >
      <div
        className="text-text-muted uppercase mb-2"
        style={{ fontSize: '10.5px', letterSpacing: '0.5px' }}
      >
        Matriz de risco — exposição por fator
      </div>
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: '110px repeat(4, 1fr)', fontSize: '10px' }}
        role="img"
        aria-label="Matriz de risco mostrando exposição por fator em 4 níveis de severidade"
      >
        <div />
        {['leve', 'moderado', 'alto', 'crítico'].map((h) => (
          <div key={h} className="text-text-faint text-center">
            {h}
          </div>
        ))}
        {rows.map((row) => (
          <>
            <div key={row.factor} className="text-text-secondary py-1">
              {row.factor}
            </div>
            {row.cells.map((cell, ci) => (
              <div
                key={ci}
                className={`flex items-center justify-center rounded font-mono ${cell.bgClass} ${cell.fgClass}`}
                style={{ height: '26px', fontSize: '10px' }}
              >
                {cell.t}
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}
