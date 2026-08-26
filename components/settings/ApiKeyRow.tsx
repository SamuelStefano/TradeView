'use client';

import { useState } from 'react';
import { ConfirmByTyping } from '@/components/ui/ConfirmByTyping';

export interface ApiKey {
  name: string;
  mask: string;
  scope: string;
  rot: string;
  old: boolean;
}

interface ApiKeyRowProps {
  apiKey: ApiKey;
  onRevoke: (name: string) => void;
  onRotate: (name: string) => void;
}

export function ApiKeyRow({ apiKey, onRevoke, onRotate }: ApiKeyRowProps) {
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [rotateOpen, setRotateOpen] = useState(false);

  const scopeDanger = apiKey.scope === 'ORDEM + LEITURA';

  return (
    <>
      <div className="flex items-center gap-3.5 py-2 border-b border-divider">
        <span className="font-semibold" style={{ width: 130, fontSize: '12.5px' }}>
          {apiKey.name}
        </span>
        <span className="font-mono text-text-faint" style={{ fontSize: '11.5px' }}>
          {apiKey.mask}
        </span>
        <span
          className="rounded font-semibold"
          style={{
            fontSize: '10px',
            color: scopeDanger ? 'var(--color-down)' : 'var(--color-text-muted)',
            background: scopeDanger ? 'var(--color-down-bg)' : 'var(--color-hover)',
            padding: '2px 8px',
          }}
        >
          {apiKey.scope}
        </span>
        <span
          className="ml-auto font-mono"
          style={{
            fontSize: '10.5px',
            color: apiKey.old ? 'var(--color-warn)' : 'var(--color-text-faint)',
          }}
        >
          rotação: {apiKey.rot}
        </span>
        <button
          onClick={() => setRotateOpen(true)}
          aria-label={`Rotacionar chave de ${apiKey.name}`}
          className="border border-border-strong rounded-md text-text-muted hover:text-text cursor-pointer"
          style={{ height: 24, padding: '0 10px', background: 'var(--color-hover)', fontSize: '10.5px', fontFamily: 'inherit' }}
        >
          Rotacionar
        </button>
        <button
          onClick={() => setRevokeOpen(true)}
          aria-label={`Revogar chave de ${apiKey.name}`}
          className="border border-danger-border rounded-md text-down cursor-pointer"
          style={{ height: 24, padding: '0 10px', background: 'var(--color-down-bg)', fontSize: '10.5px', fontFamily: 'inherit' }}
        >
          Revogar
        </button>
      </div>

      <ConfirmByTyping
        open={rotateOpen}
        onClose={() => setRotateOpen(false)}
        onConfirm={() => {
          setRotateOpen(false);
          onRotate(apiKey.name);
        }}
        phrase="rotacionar chave"
        title={`Rotacionar chave de ${apiKey.name}`}
        description={`Uma chave nova será gerada e ${apiKey.mask} deixa de funcionar imediatamente. Estratégias que usam essa integração param até a nova chave propagar.`}
        confirmLabel="Rotacionar agora"
      />

      <ConfirmByTyping
        open={revokeOpen}
        onClose={() => setRevokeOpen(false)}
        onConfirm={() => {
          setRevokeOpen(false);
          onRevoke(apiKey.name);
        }}
        phrase="revogar chave"
        title={`Revogar chave de ${apiKey.name}`}
        description={`Esta ação é irreversível. A chave ${apiKey.mask} será imediatamente invalidada. Você precisará gerar uma nova chave na plataforma.`}
        confirmLabel="Revogar chave"
        danger
      />
    </>
  );
}
