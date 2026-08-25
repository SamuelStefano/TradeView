'use client';

import { useState } from 'react';
import type { Signal } from '@/lib/types';

interface SignalsFeedProps {
  signals: Signal[];
  analyzing: { asset: string; startedAgo: string } | null;
}

function directionColor(dir: string): string {
  return dir === 'SHORT' || dir === 'VENDA' || dir === 'BAIXA' ? 'var(--color-down)' : 'var(--color-up)';
}

function directionArrow(dir: string): string {
  return dir === 'SHORT' || dir === 'VENDA' || dir === 'BAIXA' ? '▼' : '▲';
}

export function SignalsFeed({ signals, analyzing }: SignalsFeedProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <section
      aria-label="Sinais da IA"
      className="bg-surface border border-border rounded-lg"
      style={{ padding: '14px' }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
        <span
          className="text-ai font-semibold uppercase"
          style={{ fontSize: '11px', letterSpacing: '0.6px' }}
        >
          ✦ Sinais da IA
        </span>
        <span className="text-text-faint" style={{ fontSize: '10px' }}>
          ordenado por convicção
        </span>
        <div className="ml-auto flex items-center gap-1.5" style={{ fontSize: '10px' }}>
          <span
            className="rounded-full"
            style={{
              width: 6,
              height: 6,
              background: 'var(--color-up)',
              animation: 'shimmer 2s infinite',
              display: 'inline-block',
            }}
            aria-hidden="true"
          />
          <span className="text-text-muted">tempo real</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {signals.map((signal) => {
          const isOpen = openId === signal.id;
          const dirColor = directionColor(signal.direction);
          const dirArrow = directionArrow(signal.direction);
          const convW = `${signal.conviction}%`;

          return (
            <div
              key={signal.id}
              className="bg-inset border border-border rounded"
              style={{ padding: '10px 12px', borderRadius: '7px' }}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-semibold" style={{ fontSize: '12.5px' }}>
                  {signal.asset}
                </span>
                <span className="font-bold" style={{ fontSize: '10.5px', letterSpacing: '0.5px', color: dirColor }}>
                  {dirArrow} {signal.direction}
                </span>
                <span className="text-text-faint" style={{ fontSize: '10px' }}>
                  {signal.horizon}
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <div
                    role="img"
                    aria-label={`convicção ${signal.conviction} de 100`}
                    className="bg-border rounded"
                    style={{ width: 64, height: 5, overflow: 'hidden' }}
                  >
                    <div
                      className="h-full bg-ai rounded"
                      style={{ width: convW }}
                    />
                  </div>
                  <span
                    className="font-mono tabular-nums text-ai font-semibold"
                    style={{ fontSize: '11.5px' }}
                  >
                    {signal.conviction}
                  </span>
                </div>
              </div>
              <div className="text-text-secondary" style={{ fontSize: '12px', marginTop: '6px', lineHeight: '1.45' }}>
                {signal.thesis}
              </div>
              <div className="flex items-center gap-2.5" style={{ marginTop: '6px' }}>
                <button
                  onClick={() => toggle(signal.id)}
                  aria-expanded={isOpen}
                  className="text-accent hover:text-accent-hover cursor-pointer bg-transparent border-0 p-0 font-sans"
                  style={{ fontSize: '11px' }}
                >
                  {isOpen ? 'ocultar por quê' : 'por quê ▾'}
                </button>
                <span className="font-mono text-text-faint" style={{ fontSize: '10px' }}>
                  {signal.ago}
                </span>
              </div>
              {isOpen && (
                <div
                  className="text-text-secondary"
                  style={{
                    marginTop: '8px',
                    padding: '9px 11px',
                    background: 'var(--color-ai-bg)',
                    border: '1px solid var(--color-ai-border)',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    lineHeight: '1.5',
                  }}
                >
                  {signal.why}
                  <div style={{ marginTop: '5px', fontSize: '10.5px' }} className="text-text-faint">
                    fontes:{' '}
                    {signal.sources.map((src, i) => (
                      <span key={src.label}>
                        {i > 0 && ' · '}
                        <a href={src.url} className="text-accent hover:text-accent-hover">
                          {src.label}
                        </a>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {analyzing && (
          <div
            aria-label="IA analisando"
            className="bg-inset border border-dashed border-ai-border rounded flex items-center gap-2.5"
            style={{ padding: '10px 12px', borderRadius: '7px' }}
          >
            <span
              className="text-ai"
              style={{ animation: 'shimmer 1.4s infinite' }}
              aria-hidden="true"
            >
              ✦
            </span>
            <div className="flex-1 flex flex-col gap-1.5">
              <div
                className="bg-border rounded animate-pulse"
                style={{ height: 8, width: '38%' }}
              />
              <div
                className="rounded animate-pulse"
                style={{ height: 8, width: '72%', background: 'var(--color-active)' }}
              />
            </div>
            <span className="text-text-faint" style={{ fontSize: '10px' }}>
              analisando fluxo {analyzing.asset}…
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
