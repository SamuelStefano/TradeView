'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

interface Provider {
  name: string;
  kind: string;
}

const PROVIDERS: Provider[] = [
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

const TOTAL_STEPS = 5;

type Scope = 'leitura' | 'ordens';

interface ConnectFlowModalProps {
  open: boolean;
  onClose: () => void;
}

export function ConnectFlowModal({ open, onClose }: ConnectFlowModalProps) {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState<Provider>(PROVIDERS[0]);
  const [scope, setScope] = useState<Scope>('leitura');

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function pickProvider(pv: Provider) {
    setProvider(pv);
    next();
  }

  function pickScope(s: Scope) {
    setScope(s);
    next();
  }

  const dots = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1 <= step);

  const nextLabel: Record<number, string> = {
    1: 'Continuar',
    2: 'Testar conexão',
    3: 'Escolher escopo',
    4: 'Revisar',
    5: '',
  };

  const isLast = step === TOTAL_STEPS;

  return (
    <Modal
      open={open}
      onClose={onClose}
      label="Conectar integração"
      className="w-[520px] p-5 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-bold text-text">Conectar integração</span>
        <span className="ml-auto font-mono text-text-faint" style={{ fontSize: '10.5px' }}>
          passo {step}/{TOTAL_STEPS}
        </span>
      </div>

      <div className="flex gap-1">
        {dots.map((active, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm ${active ? 'bg-accent' : 'bg-border'}`}
            style={{ height: 3 }}
          />
        ))}
      </div>

      {step === 1 && <Step1 onSelect={pickProvider} />}
      {step === 2 && <Step2 provider={provider} />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 onSelect={pickScope} />}
      {step === 5 && <Step5 provider={provider} scope={scope} />}

      <div className="flex gap-2 justify-end">
        <button
          onClick={onClose}
          className="h-[30px] px-3 bg-hover border border-border-strong rounded-md text-text-secondary cursor-pointer font-sans"
          style={{ fontSize: '12px' }}
        >
          Cancelar
        </button>
        {!isLast && (
          <button
            onClick={next}
            className="h-[30px] px-3.5 bg-accent-bg border border-accent-border rounded-md text-accent-hover font-semibold cursor-pointer font-sans"
            style={{ fontSize: '12px' }}
          >
            {nextLabel[step]}
          </button>
        )}
        {isLast && (
          <button
            onClick={onClose}
            className="h-[30px] px-3.5 bg-up-bg border border-up-border rounded-md text-up font-semibold cursor-pointer font-sans"
            style={{ fontSize: '12px' }}
          >
            Confirmar conexão
          </button>
        )}
      </div>
    </Modal>
  );
}

function Step1({ onSelect }: { onSelect: (pv: Provider) => void }) {
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

function Step2({ provider }: { provider: Provider }) {
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

function Step3() {
  return (
    <div className="flex flex-col gap-2 font-mono" style={{ fontSize: '11.5px' }}>
      <div className="text-up">✓ autenticação OK (182ms)</div>
      <div className="text-up">✓ leitura de saldos OK — 14 ativos encontrados</div>
      <div className="text-up">✓ websocket de preços OK</div>
      <div className="text-text-muted">· permissão de ordem: presente na chave (não será usada sem o passo 4)</div>
    </div>
  );
}

function Step4({ onSelect }: { onSelect: (s: Scope) => void }) {
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

function Step5({ provider, scope }: { provider: Provider; scope: Scope }) {
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
