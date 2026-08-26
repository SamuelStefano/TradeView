'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PROVIDERS, Step1, Step2, Step3, Step4, Step5, type Scope } from './ConnectFlowSteps';

const TOTAL_STEPS = 5;

interface Provider {
  name: string;
  kind: string;
}

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
