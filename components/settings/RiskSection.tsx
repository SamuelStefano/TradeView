const LIMITS = [
  { k: 'Exposição máxima por ativo', v: '15% do patrimônio' },
  { k: 'Tamanho máximo de ordem', v: 'R$ 100.000,00' },
  { k: 'Perda diária máxima (auto-pausa bots)', v: '−2,0% / dia' },
  { k: 'Alavancagem máxima', v: '2,0x' },
];

export function RiskSection() {
  return (
    <section
      aria-label="Risco"
      className="bg-surface border border-border rounded-lg p-3.5 flex flex-col gap-2.5"
    >
      <div
        className="text-text-muted font-medium uppercase"
        style={{ fontSize: '11px', letterSpacing: '0.6px' }}
      >
        Limites de risco
      </div>
      {LIMITS.map((l) => (
        <div key={l.k} className="flex items-center gap-2.5" style={{ fontSize: '12px' }}>
          <span className="flex-1 text-text-secondary">{l.k}</span>
          <span
            className="font-mono bg-inset border border-border-strong rounded-md"
            style={{ fontVariantNumeric: 'tabular-nums', padding: '4px 10px' }}
          >
            {l.v}
          </span>
        </div>
      ))}
      <div
        className="flex items-center gap-3 border border-danger-border rounded-lg"
        style={{ background: '#1C0F12', padding: '10px 12px' }}
      >
        <div className="flex-1">
          <div className="font-semibold text-down" style={{ fontSize: '12px' }}>Kill switch global</div>
          <div className="text-text-muted" style={{ fontSize: '10.5px' }}>
            acessível na barra superior em qualquer tela · atalho{' '}
            <span className="font-mono">Ctrl+Shift+X</span>
          </div>
        </div>
        <span className="font-mono text-up" style={{ fontSize: '10.5px' }}>armado</span>
      </div>
    </section>
  );
}
