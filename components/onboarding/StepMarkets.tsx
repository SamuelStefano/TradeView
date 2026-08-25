'use client';

type SelectionMap = Record<string, boolean>;

const MARKET_DEFS: [string, string, string][] = [
  ['Cripto', 'cripto', 'spot + perpétuos'],
  ['Renda variável', 'renda variável', 'B3 + US'],
  ['Renda fixa', 'renda fixa', 'Tesouro, CDB, curva'],
  ['Câmbio', 'câmbio', 'majors + USD/BRL'],
  ['Energia', 'energia', 'PLD, forwards, carbono'],
  ['Commodities', 'commodities', 'agro, metais, petróleo'],
  ['Índices', 'índices', 'futuros + vol'],
  ['Fundos / FIIs', 'fundos / fiis', 'REITs, ETFs'],
];

interface StepMarketsProps {
  selection: SelectionMap;
  onToggle: (key: string) => void;
}

export function StepMarkets({ selection, onToggle }: StepMarketsProps) {
  return (
    <div>
      <h1 className="text-text font-bold" style={{ margin: '0 0 6px', fontSize: 20 }}>
        Quais mercados você acompanha?
      </h1>
      <p className="text-text-muted" style={{ margin: '0 0 16px', fontSize: '12.5px' }}>
        Isso define o que aparece no seu overview. Dá pra mudar depois.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {MARKET_DEFS.map(([label, key, description]) => {
          const on = !!selection[key];
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              aria-pressed={on}
              style={{
                padding: 12,
                background: on ? '#161D2E' : '#10141C',
                border: `1px solid ${on ? '#2E4370' : '#1A202E'}`,
                borderRadius: 7,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: on ? '#E8ECF4' : '#8A93A8',
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: '9.5px', color: '#5A6478', marginTop: 2 }}>
                {description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
