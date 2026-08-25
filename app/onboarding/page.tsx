'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepDots } from '@/components/onboarding/StepDots';
import { StepMarkets } from '@/components/onboarding/StepMarkets';
import { StepIntegrations } from '@/components/onboarding/StepIntegrations';
import { StepRiskProfile } from '@/components/onboarding/StepRiskProfile';
import { StepFirstSignal } from '@/components/onboarding/StepFirstSignal';

type SelectionMap = Record<string, boolean>;

const TOTAL_STEPS = 4;

const INITIAL_SELECTION: SelectionMap = {
  cripto: true,
  'renda fixa': true,
  energia: true,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState<SelectionMap>(INITIAL_SELECTION);
  const [profile, setProfile] = useState('Moderado');

  function toggleMarket(key: string) {
    setSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      router.push('/');
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      router.push('/');
    }
  }

  const backLabel = step === 1 ? 'Pular tudo' : '← Voltar';
  const nextLabel = step === TOTAL_STEPS ? 'Abrir o terminal' : 'Continuar →';

  return (
    <div
      className="bg-base text-text"
      style={{
        minHeight: 'calc(100vh - 66px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        padding: 24,
      }}
    >
      <div style={{ width: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <StepDots total={TOTAL_STEPS} current={step} />

        {step === 1 && (
          <StepMarkets selection={selection} onToggle={toggleMarket} />
        )}
        {step === 2 && <StepIntegrations />}
        {step === 3 && (
          <StepRiskProfile selected={profile} onSelect={setProfile} />
        )}
        {step === 4 && <StepFirstSignal />}

        <div className="flex gap-2 justify-between">
          <button
            onClick={handleBack}
            className="text-text-faint cursor-pointer hover:text-text-muted"
            style={{
              height: 32,
              padding: '0 14px',
              background: 'none',
              border: 'none',
              fontSize: 12,
              fontFamily: 'inherit',
            }}
          >
            {backLabel}
          </button>
          <button
            onClick={handleNext}
            className="font-semibold cursor-pointer hover:border-accent"
            style={{
              height: 32,
              padding: '0 18px',
              background: '#16233F',
              border: '1px solid #2E4370',
              borderRadius: 6,
              color: '#7DA0FF',
              fontSize: 12,
              fontFamily: 'inherit',
            }}
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
