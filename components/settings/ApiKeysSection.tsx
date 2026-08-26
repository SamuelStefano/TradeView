'use client';

import { useState } from 'react';
import { ApiKeyRow, type ApiKey } from './ApiKeyRow';

const API_KEYS: ApiKey[] = [
  { name: 'Binance', mask: 'AKfz••••••••3kQz', scope: 'ORDEM + LEITURA', rot: 'há 12 dias', old: false },
  { name: 'B3 / XP', mask: 'oauth••••••••••••', scope: 'ORDEM + LEITURA', rot: 'há 40 dias', old: false },
  { name: 'Coinbase', mask: 'cb_9k••••••••x2Wq', scope: 'somente leitura', rot: 'há 118 dias ⚠', old: true },
  { name: 'Glassnode', mask: 'gn_a4••••••••p8Lm', scope: 'somente leitura', rot: 'há 61 dias', old: false },
];

const HEX = 'abcdef0123456789';

function freshMask(prefix: string): string {
  let tail = '';
  for (let i = 0; i < 4; i += 1) {
    tail += HEX[Math.floor(Math.random() * HEX.length)];
  }
  return `${prefix}••••••••${tail}`;
}

export function ApiKeysSection() {
  const [keys, setKeys] = useState(API_KEYS);

  function revoke(name: string) {
    setKeys((prev) => prev.filter((k) => k.name !== name));
  }

  function rotate(name: string) {
    setKeys((prev) =>
      prev.map((k) =>
        k.name === name
          ? { ...k, mask: freshMask(k.mask.slice(0, k.mask.indexOf('•'))), rot: 'agora', old: false }
          : k,
      ),
    );
  }

  return (
    <section
      aria-label="Chaves"
      className="bg-surface border border-border rounded-lg p-3.5"
      style={{ gridColumn: '1 / -1' }}
    >
      <div
        className="text-text-muted font-medium uppercase"
        style={{ fontSize: '11px', letterSpacing: '0.6px', marginBottom: 10 }}
      >
        Chaves de API
      </div>
      {keys.map((k) => (
        <ApiKeyRow key={k.name} apiKey={k} onRevoke={revoke} onRotate={rotate} />
      ))}
      {keys.length === 0 && (
        <div className="text-text-muted py-2" style={{ fontSize: '12px' }} role="status" aria-live="polite">
          Nenhuma chave conectada. Sem chave, o terminal roda somente com dados públicos.
        </div>
      )}
      <div className="text-text-faint mt-2" style={{ fontSize: '10px' }}>
        Chaves nunca são exibidas por completo — nem para você. Revogação exige confirmação por extenso.
      </div>
    </section>
  );
}
