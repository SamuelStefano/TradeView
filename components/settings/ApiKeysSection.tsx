import { ApiKeyRow } from './ApiKeyRow';

const API_KEYS = [
  { name: 'Binance', mask: 'AKfz••••••••3kQz', scope: 'ORDEM + LEITURA', rot: 'há 12 dias', old: false },
  { name: 'B3 / XP', mask: 'oauth••••••••••••', scope: 'ORDEM + LEITURA', rot: 'há 40 dias', old: false },
  { name: 'Coinbase', mask: 'cb_9k••••••••x2Wq', scope: 'somente leitura', rot: 'há 118 dias ⚠', old: true },
  { name: 'Glassnode', mask: 'gn_a4••••••••p8Lm', scope: 'somente leitura', rot: 'há 61 dias', old: false },
];

export function ApiKeysSection() {
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
      {API_KEYS.map((k) => (
        <ApiKeyRow key={k.name} apiKey={k} />
      ))}
      <div className="text-text-faint mt-2" style={{ fontSize: '10px' }}>
        Chaves nunca são exibidas por completo — nem para você. Revogação exige confirmação por extenso.
      </div>
    </section>
  );
}
