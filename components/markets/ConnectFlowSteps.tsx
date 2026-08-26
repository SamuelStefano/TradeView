interface Provider {
  name: string;
  kind: string;
}

export const PROVIDERS: Provider[] = [
  { name: 'Binance', kind: 'cripto' },
  { name: 'Coinbase', kind: 'cripto' },
  { name: 'Bybit', kind: 'cripto' },
  { name: 'XP / Rico', kind: 'B3' },
  { name: 'Interactive Brokers', kind: 'ações US' },
  { name: 'Tesouro Direto', kind: 'renda fixa' },
  { name: 'CCEE', kind: 'energia BR' },
  { name: 'ENTSO-E', kind: 'energia UE' },
  { name: 'OANDA', kind: 'câmbio' },
];

export type Scope = 'leitura' | 'ordens';

export interface StepProvider {
  name: string;
  kind: string;
}

export function Step1({ onSelect }: { onSelect: (pv: Provider) => void }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {PROVIDERS.map((pv) => (
        <button
          key={pv.name}
          onClick={() => onSelect(pv)}
          className="flex flex-col gap-1 items-start p-3 bg-inset border border-border rounded-lg cursor-pointer font-sans text-left hover:border-accent-border transition-colors"
        >
          <span className="font-semibold text-text" style={{ fontSize: '12px' }}>{pv.name}</span>
          <span className="text-text-faint" style={{ fontSize: '9.5px' }}>{pv.kind}</span>
        </button>
      ))}
    </div>
  );
}

export function Step2({ provider }: { provider: Provider }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-text-secondary" style={{ fontSize: '12.5px' }}>
        Cole a chave de API da <strong className="text-text">{provider.name}</strong>. Prefira uma chave somente-leitura — a permissão de ordem só é exigida no passo 4. Depois de salva, a chave não aparece completa de novo.
      </p>
      <label className="text-text-muted flex flex-col gap-1" style={{ fontSize: '11px' }}>
        API key
        <input
          value="AKfz••••••••••••••••3kQz"
          readOnly
          className="h-[34px] px-2.5 bg-base border border-border-strong rounded-md text-text-muted font-mono outline-none"
          style={{ fontSize: '12px' }}
          aria-label="API key (mascarada)"
        />
      </label>
      <label className="text-text-muted flex flex-col gap-1" style={{ fontSize: '11px' }}>
        Secret
        <input
          value="••••••••••••••••••••••••"
          readOnly
          className="h-[34px] px-2.5 bg-base border border-border-strong rounded-md text-text-muted font-mono outline-none"
          style={{ fontSize: '12px' }}
          aria-label="Secret key (mascarada)"
        />
      </label>
    </div>
  );
}

export function Step3() {
  return (
    <div className="flex flex-col gap-2 font-mono" style={{ fontSize: '11.5px' }}>
      <div className="text-up">✓ autenticação OK (182ms)</div>
      <div className="text-up">✓ leitura de saldos OK — 14 ativos encontrados</div>
      <div className="text-up">✓ websocket de preços OK</div>
      <div className="text-text-muted">· permissão de ordem: presente na chave (não será usada sem o passo 4)</div>
    </div>
  );
}

export function Step4({ onSelect }: { onSelect: (s: Scope) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => onSelect('leitura')}
        className="flex gap-2.5 items-start p-3 bg-up-bg border-2 border-up rounded-lg cursor-pointer font-sans text-left"
      >
        <span className="text-up mt-0.5">●</span>
        <div>
          <div className="font-semibold text-text" style={{ fontSize: '12.5px' }}>
            Somente leitura{' '}
            <span
              className="text-up border border-up-border rounded px-1 ml-1.5"
              style={{ fontSize: '9.5px', padding: '1px 5px' }}
            >
              recomendado · padrão
            </span>
          </div>
          <div className="text-text-muted mt-0.5" style={{ fontSize: '11px' }}>
            Preços, saldos e histórico. Nenhuma ordem pode ser enviada.
          </div>
        </div>
      </button>
      <button
        onClick={() => onSelect('ordens')}
        className="flex gap-2.5 items-start p-3 bg-down-bg border border-danger-border rounded-lg cursor-pointer font-sans text-left"
      >
        <span className="text-down mt-0.5">⚠</span>
        <div>
          <div className="font-semibold text-down" style={{ fontSize: '12.5px' }}>
            Leitura + envio de ORDENS
          </div>
          <div className="mt-0.5 text-text-secondary" style={{ fontSize: '11px' }}>
            Este app poderá movimentar dinheiro real nesta conta. Cada ordem ainda exigirá sua confirmação explícita, mas trate esta permissão como perigosa.
          </div>
        </div>
      </button>
    </div>
  );
}

export function Step5({ provider, scope }: { provider: Provider; scope: Scope }) {
  const orders = scope === 'ordens';

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-text-secondary" style={{ fontSize: '12.5px', lineHeight: 1.55 }}>
        Confirme: conectar <strong className="text-text">{provider.name}</strong> em modo{' '}
        <strong className={orders ? 'text-down' : 'text-up'}>
          {orders ? 'leitura + envio de ordens' : 'somente leitura'}
        </strong>
        , chave terminada em <span className="font-mono">3kQz</span>, rotação sugerida a cada 90 dias.
      </p>
      {orders && (
        <p
          className="border border-danger-border rounded-md bg-down-bg text-down p-2.5 m-0"
          style={{ fontSize: '11.5px', lineHeight: 1.5 }}
        >
          ⚠ Esta chave poderá movimentar dinheiro real na sua conta {provider.name}. Se você não
          precisa enviar ordens hoje, volte e escolha somente leitura.
        </p>
      )}
      <p className="text-text-faint" style={{ fontSize: '11px' }}>
        Você pode revogar a qualquer momento em Configurações → Chaves.
      </p>
    </div>
  );
}
