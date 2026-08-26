'use client';

import { useState } from 'react';

const PROVIDERS = [
  { n: 'Binance', k: 'cripto' },
  { n: 'XP / Rico', k: 'B3' },
  { n: 'Tesouro Direto', k: 'renda fixa' },
  { n: 'Interactive Brokers', k: 'ações US' },
  { n: 'CCEE', k: 'energia' },
  { n: 'OANDA', k: 'câmbio' },
];

export function StepIntegrations() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <h1 className="text-text font-bold" style={{ margin: '0 0 6px', fontSize: 20 }}>
        Conecte sua primeira integração
      </h1>
      <p className="text-text-muted" style={{ margin: '0 0 16px', fontSize: '12.5px' }}>
        Começamos em somente leitura — o app não pode operar nada.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {PROVIDERS.map((p) => {
          const on = selected === p.n;
          return (
            <button
              key={p.n}
              onClick={() => setSelected(on ? null : p.n)}
              aria-pressed={on}
              className="hover:border-accent-border"
              style={{
                padding: '14px 12px',
                background: on ? 'var(--color-accent-bg)' : 'var(--color-surface)',
                border: `1px solid ${on ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
                borderRadius: 7,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: on ? 'var(--color-accent-hover)' : 'var(--color-text)' }}>{p.n}</div>
              <div style={{ fontSize: '9.5px', color: 'var(--color-text-faint)', marginTop: 2 }}>{p.k}</div>
            </button>
          );
        })}
      </div>
      <p role="status" aria-live="polite" className="text-text-faint" style={{ margin: '10px 0 0', fontSize: '10.5px' }}>
        {selected
          ? `${selected} escolhida — a chave é colada em Configurações, com escopo de leitura.`
          : 'Escolha um provedor para começar. Você pode conectar os outros depois.'}
      </p>
    </div>
  );
}
