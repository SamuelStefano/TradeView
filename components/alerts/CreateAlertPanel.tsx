'use client';

import { useState } from 'react';

const KIND_OPTIONS = [
  { label: 'Preço',            active: false },
  { label: 'Indicador',        active: false },
  { label: 'Notícia',          active: false },
  { label: 'On-chain',         active: false },
  { label: 'Linguagem natural', active: true },
];

const CHANNEL_OPTIONS = [
  { label: 'Push',      active: true },
  { label: 'E-mail',    active: true },
  { label: 'Telegram',  active: false },
  { label: 'Discord',   active: false },
  { label: 'WhatsApp',  active: false },
];

export function CreateAlertPanel() {
  const [kinds, setKinds] = useState(KIND_OPTIONS);
  const [channels, setChannels] = useState(CHANNEL_OPTIONS);

  function toggleKind(i: number) {
    setKinds((prev) => prev.map((k, idx) => ({ ...k, active: idx === i ? !k.active : k.active })));
  }

  function toggleChannel(i: number) {
    setChannels((prev) => prev.map((c, idx) => ({ ...c, active: idx === i ? !c.active : c.active })));
  }

  return (
    <section
      aria-label="Criar alerta"
      className="bg-surface border border-border rounded-lg p-3.5 flex flex-col gap-3"
    >
      <div
        className="text-text-muted uppercase"
        style={{ fontSize: '11px', letterSpacing: '0.6px' }}
      >
        Novo alerta
      </div>

      <div className="flex gap-1 flex-wrap">
        {kinds.map((k, i) => (
          <button
            key={k.label}
            onClick={() => toggleKind(i)}
            aria-pressed={k.active}
            className={`rounded cursor-pointer font-sans border transition-colors ${
              k.active
                ? 'text-ai bg-ai-bg border-ai-border'
                : 'text-text-muted bg-inset border-border-strong hover:text-text'
            }`}
            style={{ fontSize: '10.5px', padding: '4px 9px' }}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div>
        <div className="text-text-faint mb-1.5" style={{ fontSize: '10.5px' }}>
          Condição em linguagem natural
        </div>
        <div className="bg-base border border-ai-border rounded-lg px-3 py-2.5 leading-relaxed text-text" style={{ fontSize: '12.5px' }}>
          me avise se o{' '}
          <strong className="text-ai">funding do BTC</strong> ficar positivo por mais de{' '}
          <strong className="text-ai">4 horas</strong> enquanto o preço estiver acima da{' '}
          <strong className="text-ai">MA(21) diária</strong>
        </div>
        <div className="mt-1.5 font-mono text-up" style={{ fontSize: '10.5px' }}>
          ✓ interpretado: funding_8h &gt; 0 por 4h E preço &gt; MA(21,1D)
        </div>
      </div>

      <div>
        <div className="text-text-faint mb-1.5" style={{ fontSize: '10.5px' }}>
          Canais
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {channels.map((ch, i) => (
            <button
              key={ch.label}
              onClick={() => toggleChannel(i)}
              aria-pressed={ch.active}
              className={`rounded cursor-pointer font-sans border transition-colors ${
                ch.active
                  ? 'text-accent-hover bg-accent-bg border-accent-border'
                  : 'text-text-muted bg-inset border-border-strong hover:text-text'
              }`}
              style={{ fontSize: '10.5px', padding: '4px 10px' }}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      <button
        className="h-8 bg-accent-bg border border-accent-border rounded-md text-accent-hover font-semibold cursor-pointer font-sans hover:bg-accent-bg-soft transition-colors"
        style={{ fontSize: '12px' }}
      >
        Criar alerta
      </button>

      <p className="text-text-faint leading-relaxed" style={{ fontSize: '10px' }}>
        Alertas nunca executam ordens — apenas notificam. Disparos ficam registrados para auditoria de acurácia.
      </p>
    </section>
  );
}
