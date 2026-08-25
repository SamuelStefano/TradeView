'use client';

import { useState } from 'react';
import { ConfirmByTyping } from '@/components/ui/ConfirmByTyping';
import type { AlertItem, AlertKind, AlertChannel } from '@/lib/data/mock/alerts';

const kindStyles: Record<AlertKind, { fg: string; bg: string }> = {
  'PREÇO':      { fg: 'text-accent-hover', bg: 'bg-accent-bg' },
  'INDICADOR':  { fg: 'text-warn',         bg: 'bg-warn-bg' },
  'NOTÍCIA':    { fg: 'text-cyan',         bg: 'bg-inset' },
  'ON-CHAIN':   { fg: 'text-ai',           bg: 'bg-ai-bg' },
  'NATURAL':    { fg: 'text-up',           bg: 'bg-up-bg' },
};

const channelLabel: Record<AlertChannel, string> = {
  'push':      'push',
  'e-mail':    'e-mail',
  'telegram':  'telegram',
  'discord':   'discord',
  'whatsapp':  'whatsapp',
};

interface AlertListProps {
  alerts: AlertItem[];
}

export function AlertList({ alerts }: AlertListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [items, setItems] = useState(alerts);

  function handleDelete() {
    setItems((prev) => prev.filter((a) => a.id !== deletingId));
    setDeletingId(null);
  }

  return (
    <>
      <section
        aria-label="Alertas ativos"
        className="bg-surface border border-border rounded-lg overflow-hidden"
      >
        {items.map((al) => {
          const style = kindStyles[al.kind];
          return (
            <div
              key={al.id}
              className="flex items-center gap-3 px-3.5 py-2.5 border-b border-divider last:border-b-0 hover:bg-hover"
            >
              <span
                className={`font-mono font-semibold rounded flex-shrink-0 text-center ${style.fg} ${style.bg}`}
                style={{ fontSize: '9.5px', padding: '2px 7px', width: '70px' }}
              >
                {al.kind}
              </span>

              <div className="flex-1 min-w-0">
                <div className="text-text" style={{ fontSize: '12.5px' }}>
                  {al.cond}
                </div>
                <div className="text-text-faint" style={{ fontSize: '10px' }}>
                  {al.meta}
                </div>
              </div>

              <div className="flex gap-1">
                {al.channels.map((ch) => (
                  <span
                    key={ch}
                    className="text-text-muted border border-border-strong rounded"
                    style={{ fontSize: '9.5px', padding: '1px 6px' }}
                  >
                    {channelLabel[ch]}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setDeletingId(al.id)}
                className="h-6 px-2.5 bg-hover border border-border-strong rounded text-text-muted cursor-pointer font-sans hover:text-text hover:border-border-hover"
                style={{ fontSize: '10.5px' }}
              >
                Apagar
              </button>
            </div>
          );
        })}
      </section>

      <ConfirmByTyping
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        phrase="apagar alerta"
        title="Apagar alerta"
        description="Esta ação remove o alerta permanentemente. O histórico de disparos é mantido para auditoria."
        confirmLabel="Apagar"
        danger
      />
    </>
  );
}
