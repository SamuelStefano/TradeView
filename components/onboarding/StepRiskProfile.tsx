'use client';

const PROFILES = [
  {
    n: 'Conservador',
    d: 'sem alavancagem, bots só em paper, ordem máx. R$ 20k',
    m: 'VaR alvo < 0,5%/d',
  },
  {
    n: 'Moderado',
    d: 'alavancagem até 1,5x, bots reais com limites apertados',
    m: 'VaR alvo < 1,5%/d',
  },
  {
    n: 'Agressivo',
    d: 'alavancagem até 3x, limites largos — exige dupla confirmação',
    m: 'VaR alvo < 3%/d',
  },
];

interface StepRiskProfileProps {
  selected: string;
  onSelect: (name: string) => void;
}

export function StepRiskProfile({ selected, onSelect }: StepRiskProfileProps) {
  return (
    <div>
      <h1 className="text-text font-bold" style={{ margin: '0 0 6px', fontSize: 20 }}>
        Seu perfil de risco
      </h1>
      <p className="text-text-muted" style={{ margin: '0 0 16px', fontSize: '12.5px' }}>
        Define limites padrão de exposição, tamanho de ordem e quando os bots pausam sozinhos.
      </p>
      <div className="flex flex-col gap-2">
        {PROFILES.map((pr) => {
          const on = selected === pr.n;
          return (
            <button
              key={pr.n}
              onClick={() => onSelect(pr.n)}
              className="flex gap-3 text-left items-center cursor-pointer"
              style={{
                padding: '13px 14px',
                background: on ? '#161D2E' : '#10141C',
                border: `1px solid ${on ? '#2E4370' : '#1A202E'}`,
                borderRadius: 7,
                fontFamily: 'inherit',
              }}
            >
              <div className="flex-1">
                <div className="font-semibold text-text" style={{ fontSize: 13 }}>{pr.n}</div>
                <div className="text-text-muted" style={{ fontSize: 11, marginTop: 2 }}>{pr.d}</div>
              </div>
              <span className="font-mono text-text-muted" style={{ fontSize: 11 }}>{pr.m}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
