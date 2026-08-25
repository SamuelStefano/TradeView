const PROVIDERS = [
  { n: 'Binance', k: 'cripto' },
  { n: 'XP / Rico', k: 'B3' },
  { n: 'Tesouro Direto', k: 'renda fixa' },
  { n: 'Interactive Brokers', k: 'ações US' },
  { n: 'CCEE', k: 'energia' },
  { n: 'OANDA', k: 'câmbio' },
];

export function StepIntegrations() {
  return (
    <div>
      <h1 className="text-text font-bold" style={{ margin: '0 0 6px', fontSize: 20 }}>
        Conecte sua primeira integração
      </h1>
      <p className="text-text-muted" style={{ margin: '0 0 16px', fontSize: '12.5px' }}>
        Começamos em somente leitura — o app não pode operar nada.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {PROVIDERS.map((p) => (
          <button
            key={p.n}
            className="hover:border-accent-border"
            style={{
              padding: '14px 12px',
              background: '#10141C',
              border: '1px solid #1A202E',
              borderRadius: 7,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#E8ECF4' }}>{p.n}</div>
            <div style={{ fontSize: '9.5px', color: '#5A6478', marginTop: 2 }}>{p.k}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
