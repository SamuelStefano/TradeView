'use client';

import { useState } from 'react';

interface RateLimitBannerProps {
  banner: {
    provider: string;
    cachedSince: string;
    renewsIn: string;
    fallbackLabel: string;
  };
}

export function RateLimitBanner({ banner }: RateLimitBannerProps) {
  const [onFallback, setOnFallback] = useState(false);

  const tone = onFallback
    ? { bg: 'bg-accent-bg', border: 'border-accent-border', text: 'text-accent-hover', hover: 'hover:bg-accent-border' }
    : { bg: 'bg-warn-bg', border: 'border-warn-border', text: 'text-warn', hover: 'hover:bg-warn-border' };

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 ${tone.bg} border ${tone.border} rounded-lg`}
      style={{ padding: '10px 14px' }}
    >
      <span className={tone.text}>◉</span>
      <div className={`flex-1 ${tone.text}`} style={{ fontSize: '12px' }}>
        {onFallback ? (
          <>
            Ações US servidas pelo fallback IEX — dados ao vivo, cobertura menor que a{' '}
            {banner.provider}. Volta sozinho quando a cota renovar em{' '}
            <span className="font-mono">{banner.renewsIn}</span>.
          </>
        ) : (
          <>
            Rate limit da {banner.provider} atingido — dados de ações US em cache desde{' '}
            <span className="font-mono">{banner.cachedSince}</span>. Renova em{' '}
            <span className="font-mono">{banner.renewsIn}</span>.
          </>
        )}
      </div>
      <button
        onClick={() => setOnFallback((v) => !v)}
        aria-pressed={onFallback}
        className={`${tone.bg} border ${tone.border} rounded ${tone.text} cursor-pointer font-sans ${tone.hover} transition-colors`}
        style={{ height: 26, padding: '0 12px', fontSize: '11px' }}
      >
        {onFallback ? 'Voltar para o cache' : banner.fallbackLabel}
      </button>
    </div>
  );
}
